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

const BASE = 'http://localhost:3000';
const SUPABASE_URL = vars.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// First login to get a session
const email = 'briau.music@gmail.com'; // adjust if needed
const password = vars.TEST_USER_PASSWORD || 'test123456';

// Get site ID
const siteId = '191a7eb5-13d0-4bd9-8f4c-22f491eba4ac';

// Minimal draft payload
const payload = {
  name: "Test site",
  settings: { description: "", maintenanceMode: false, socials: {} },
  theme: { primaryColor: "#FF6B35", fontFamily: "Space Grotesk", borderRadius: "rounded", shadow: "md", mode: "dark" },
  design: { designKey: "creator", backgroundPreset: "glow" },
  seo: { globalTitle: "Test", globalDescription: "" },
  nav: null,
  footer: null,
  pages: [{
    title: "Accueil",
    slug: "home",
    is_home: true,
    sort_order: 0,
    status: "published",
    seo_title: null,
    seo_description: null,
    blocks: [{
      type: "hero",
      sort_order: 0,
      content: { title: "Test", subtitle: "Sub", ctaLabel: "Go", ctaLink: "#" },
      style: { paddingTop: 80, paddingBottom: 80 },
      settings: {},
      visible: true,
    }]
  }]
};

console.log('Testing draft endpoint...');
console.log('Site ID:', siteId);
console.log('Payload size:', JSON.stringify(payload).length, 'bytes');

try {
  const res = await fetch(`${BASE}/api/sites/${siteId}/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log('Status:', res.status);
  const body = await res.json();
  console.log('Response:', JSON.stringify(body, null, 2));
} catch (e) {
  console.error('Fetch error:', e.message);
  console.log('Is the dev server running on localhost:3000?');
}
