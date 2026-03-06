import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const vars = {};
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0) vars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}
const url = vars.NEXT_PUBLIC_SUPABASE_URL;
const key = vars.SUPABASE_SERVICE_ROLE_KEY || vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test 1: Can we select design column?
const res = await fetch(`${url}/rest/v1/sites?select=design&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
console.log('Select design column - Status:', res.status);
const body = await res.text();
console.log('Response:', body.substring(0, 300));

// Test 2: Try updating design on first site
const res2 = await fetch(`${url}/rest/v1/sites?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
const sites = await res2.json();
if (sites.length > 0) {
  const siteId = sites[0].id;
  console.log('\nTest update design on site:', siteId);
  const res3 = await fetch(`${url}/rest/v1/sites?id=eq.${siteId}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ design: { designKey: 'test' } })
  });
  console.log('Update design - Status:', res3.status);
  if (res3.status !== 204) {
    const errBody = await res3.text();
    console.log('Error:', errBody);
  } else {
    console.log('Update OK');
    // Reset
    await fetch(`${url}/rest/v1/sites?id=eq.${siteId}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ design: null })
    });
  }
}
