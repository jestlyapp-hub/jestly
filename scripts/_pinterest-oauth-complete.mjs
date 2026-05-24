// TEMP: échange le code Pinterest -> tokens, persiste l'integration (chiffré), vérifie /ad_accounts.
// Usage: node scripts/_pinterest-oauth-complete.mjs "<full callback URL OR raw code>" [state]
import dotenv from "dotenv"; dotenv.config({ path: ".env.local" });
import { createCipheriv, randomBytes } from "node:crypto";

function enc(plain){const key=Buffer.from(process.env.ENCRYPTION_KEY,"base64");const iv=randomBytes(12);const c=createCipheriv("aes-256-gcm",key,iv);const ct=Buffer.concat([c.update(plain,"utf8"),c.final()]);const tag=c.getAuthTag();return Buffer.concat([iv,tag,ct]).toString("base64");}

const arg = process.argv[2];
if(!arg){console.error('Usage: node scripts/_pinterest-oauth-complete.mjs "<callback URL or code>" [state]');process.exit(1);}
let code, state = process.argv[3];
if(arg.includes("code=")){const u=new URL(arg);code=u.searchParams.get("code");state=state||u.searchParams.get("state");}
else code=arg;
if(!code){console.error("code introuvable");process.exit(1);}

const clientId=process.env.JESTLY_PINTEREST_APP_ID, clientSecret=process.env.JESTLY_PINTEREST_APP_SECRET, redirectUri=process.env.JESTLY_PINTEREST_REDIRECT_URI;
const ref=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const sql=(await import("postgres")).default({host:`db.${ref}.supabase.co`,port:5432,database:"postgres",username:"postgres",password:process.env.DATABASE_PASSWORD,ssl:"require",max:1});
try{
  // user_id : depuis le state si présent, sinon Gabriel
  let userId;
  if(state){const [s]=await sql`select user_id from public.oauth_states where state=${state}`;userId=s?.user_id;}
  if(!userId){const [u]=await sql`select id from auth.users where email='rasenyafx@gmail.com'`;userId=u?.id;}

  // Échange code -> tokens (Basic auth + continuous_refresh)
  const body=new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:redirectUri,continuous_refresh:"true"});
  const res=await fetch("https://api.pinterest.com/v5/oauth/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Authorization":"Basic "+Buffer.from(`${clientId}:${clientSecret}`).toString("base64")},body});
  const j=await res.json().catch(()=>({}));
  if(!res.ok||!j.access_token){console.error("❌ Échange token échoué:",res.status,JSON.stringify(j).slice(0,260));process.exit(1);}
  console.log("token exchange:",res.status,"scope:",j.scope,"expires_in:",j.expires_in,"has_refresh:",!!j.refresh_token);

  const expiresAt=new Date(Date.now()+ (j.expires_in??3600)*1000).toISOString();
  const payload={user_id:userId,provider:"pinterest",status:"active",last_error:null,oauth_access_token_encrypted:enc(j.access_token),oauth_token_expires_at:expiresAt,metadata:{scope:j.scope}};
  if(j.refresh_token)payload.oauth_refresh_token_encrypted=enc(j.refresh_token);

  const [existing]=await sql`select id from public.integrations where user_id=${userId} and provider='pinterest'`;
  let integrationId;
  if(existing){await sql`update public.integrations set ${sql(payload)} where id=${existing.id}`;integrationId=existing.id;}
  else {const [ins]=await sql`insert into public.integrations ${sql(payload)} returning id`;integrationId=ins.id;}
  if(state)await sql`delete from public.oauth_states where state=${state}`;
  console.log("✅ integration persistée:",integrationId);

  // Vérif live
  const h={Authorization:`Bearer ${j.access_token}`};
  const ua=await fetch("https://api.pinterest.com/v5/user_account",{headers:h});const uaj=await ua.json().catch(()=>({}));
  console.log("user_account:",ua.status,uaj.username?`@${uaj.username}`:"");
  const aa=await fetch("https://api.pinterest.com/v5/ad_accounts?page_size=25",{headers:h});const aaj=await aa.json().catch(()=>({}));
  console.log("ad_accounts:",aa.status);
  if(aa.ok&&Array.isArray(aaj.items)){for(const a of aaj.items)console.log(`  • ${a.id} — ${a.name} (${a.country}/${a.currency})`);console.log(aaj.items.length?"✅ ad accounts visibles":"⚠️ 0 ad account");}
  else console.log("  ↳",JSON.stringify(aaj).slice(0,240));
}catch(e){console.error("FAILED:",e.message);process.exit(1);}finally{await sql.end();}
