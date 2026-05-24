import dotenv from "dotenv"; dotenv.config({ path: ".env.local" });
import { randomUUID } from "node:crypto";
const clientId=process.env.JESTLY_PINTEREST_APP_ID, redirectUri=process.env.JESTLY_PINTEREST_REDIRECT_URI;
const ref=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const sql=(await import("postgres")).default({host:`db.${ref}.supabase.co`,port:5432,database:"postgres",username:"postgres",password:process.env.DATABASE_PASSWORD,ssl:"require",max:1});
try{
  const [user]=await sql`select id from auth.users where email='rasenyafx@gmail.com'`;
  const state=randomUUID();
  await sql`insert into public.oauth_states (state,user_id,provider,expires_at) values (${state},${user.id},'pinterest',now()+interval '1 hour')`;
  const scopes=["ads:read","pins:read","boards:read","user_accounts:read","catalogs:read"].join(",");
  const u=new URL("https://www.pinterest.com/oauth/");
  u.searchParams.set("client_id",clientId);u.searchParams.set("redirect_uri",redirectUri);u.searchParams.set("response_type","code");u.searchParams.set("scope",scopes);u.searchParams.set("state",state);
  console.log(u.toString());
}catch(e){console.error("FAILED:",e.message);process.exit(1);}finally{await sql.end();}
