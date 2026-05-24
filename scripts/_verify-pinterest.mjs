import dotenv from "dotenv"; dotenv.config({ path: ".env.local" });
import { createDecipheriv } from "node:crypto";
function dec(e){const k=Buffer.from(process.env.ENCRYPTION_KEY,"base64");const b=Buffer.from(e,"base64");const iv=b.subarray(0,12),tag=b.subarray(12,28),ct=b.subarray(28);const d=createDecipheriv("aes-256-gcm",k,iv);d.setAuthTag(tag);return Buffer.concat([d.update(ct),d.final()]).toString("utf8");}
const ref=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const sql=(await import("postgres")).default({host:`db.${ref}.supabase.co`,port:5432,database:"postgres",username:"postgres",password:process.env.DATABASE_PASSWORD,ssl:"require",max:1});
try{
  const [row]=await sql`select id,status,external_account_id,last_error,oauth_token_expires_at,(oauth_refresh_token_encrypted is not null) as has_refresh,oauth_access_token_encrypted from public.integrations where provider='pinterest' order by updated_at desc nulls last limit 1`;
  if(!row){console.log("❌ Aucune intégration Pinterest — le callback a encore échoué.");
    const st=await sql`select left(state,8) s from public.oauth_states where provider='pinterest'`;
    console.log(st.length?"   state encore présent: "+st.map(x=>x.s).join(","):"   state consommé (handleCallback a tourné puis throw).");
    process.exit(0);}
  console.log("integration:",{id:row.id,status:row.status,last_error:row.last_error,has_refresh:row.has_refresh,expires_at:row.oauth_token_expires_at});
  if(!row.oauth_access_token_encrypted){console.log("❌ pas d'access token");process.exit(0);}
  const token=dec(row.oauth_access_token_encrypted);const h={Authorization:`Bearer ${token}`};
  const ua=await fetch("https://api.pinterest.com/v5/user_account",{headers:h});const uaj=await ua.json().catch(()=>({}));
  console.log("user_account:",ua.status,uaj.username?`@${uaj.username}`:JSON.stringify(uaj).slice(0,120));
  const aa=await fetch("https://api.pinterest.com/v5/ad_accounts?page_size=25",{headers:h});const aaj=await aa.json().catch(()=>({}));
  console.log("ad_accounts:",aa.status);
  if(aa.ok&&Array.isArray(aaj.items)){for(const a of aaj.items)console.log(`  • ${a.id} — ${a.name} (${a.country}/${a.currency})`);console.log(aaj.items.length?"✅ OAuth Pinterest OK + ad accounts visibles":"⚠️ Token OK mais 0 ad account (compte sans Ads ?)");}
  else console.log("  ↳",JSON.stringify(aaj).slice(0,260));
}catch(e){console.error("FAILED:",e.message);process.exit(1);}finally{await sql.end();}
