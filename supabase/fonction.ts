// Fonction Supabase « bright-endpoint » de Cabine.
// Elle garde la clé FASHN côté serveur, vérifie que la personne est connectée,
// compte ses essais gratuits (1 essai « looks » de 3 images + 1 essai « magasin »)
// et lit la photo d'un habit à partir d'un lien.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const FREE = { look: 1, shop: 1 }, PER_TRY = 3;
const kind = (g: string) => g.startsWith('shop') ? 'shop' : 'look';
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const fashnKey = Deno.env.get('FASHN_KEY') ?? Deno.env.get('KEY') ?? Deno.env.get('key');

async function quota(uid: string) {
  const { data: rows } = await admin.from('essais').select('id, groupe').eq('user_id', uid);
  const groups = new Map<string, number>();
  for (const r of rows ?? []) { const g = r.groupe ?? 'x' + r.id; groups.set(g, (groups.get(g) ?? 0) + 1); }
  const { data: ab } = await admin.from('abonnes').select('fin').eq('user_id', uid).maybeSingle();
  const pro = !!(ab && (!ab.fin || new Date(ab.fin) > new Date()));
  const used = { look: 0, shop: 0 };
  for (const g of groups.keys()) used[kind(g)]++;
  return { used, free: FREE, pro, groups };
}

// Contenu d'une balise <meta property="..."> (écrit sans expressions régulières à guillemets, pour survivre aux copier-coller)
function metaContent(html: string, name: string) {
  const low = html.toLowerCase();
  let i = 0;
  while ((i = low.indexOf('<meta', i)) !== -1) {
    const end = low.indexOf('>', i);
    if (end === -1) break;
    const tag = html.slice(i, end), tl = low.slice(i, end);
    const hit = ['property=', 'name='].some(k => [String.fromCharCode(34), String.fromCharCode(39)].some(q => tl.includes(k + q + name + q)));
    const c = tl.indexOf('content=');
    if (hit && c !== -1) {
      const q = tag.charAt(c + 8), stop = tag.indexOf(q, c + 9);
      if (stop !== -1) return tag.slice(c + 9, stop);
    }
    i = end;
  }
  return '';
}

// Lit la photo d'aperçu (og:image) d'une page produit, comme le font les messageries pour les liens partagés
async function preview(link: string) {
  let u: URL;
  try { u = new URL(link); } catch { return { error: 'lien invalide' }; }
  if (!/^https?:$/.test(u.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[)/.test(u.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)) return { error: 'lien refusé' };
  const c = new AbortController(), to = setTimeout(() => c.abort(), 8000);
  try {
    const r = await fetch(u, { signal: c.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CabineBot/1.0; aperçu de lien)', 'Accept-Language': 'fr,en' } });
    if (!r.ok) return { error: 'site inaccessible (' + r.status + ')' };
    const html = (await r.text()).slice(0, 600000);
    const meta = (p: string) => metaContent(html, p);
    const img = meta('og:image') || meta('og:image:url') || meta('twitter:image');
    if (!img) return { error: 'pas de photo trouvée sur cette page' };
    return { image: new URL(img.replace(/&amp;/g, '&'), u).href, title: (meta('og:title') || '').replace(/&amp;/g, '&').slice(0, 120) };
  } catch { return { error: 'le site ne répond pas' }; } finally { clearTimeout(to); }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data } = jwt ? await admin.auth.getUser(jwt) : { data: { user: null } };
  const user = data?.user;
  if (!user) return json({ error: 'connexion' }, 401);
  const { action, body, id, link, group } = await req.json().catch(() => ({}));

  if (action === 'quota') { const { groups, ...q } = await quota(user.id); return json(q); }
  if (action === 'preview') return json(await preview(String(link || '')));

  const auth = { Authorization: 'Bearer ' + fashnKey, 'Content-Type': 'application/json' };
  if (action === 'run') {
    const { groups, ...q } = await quota(user.id), g = /^[\w-]{4,60}$/.test(group || '') ? group : null;
    const inGroup = g ? groups.get(g) ?? 0 : 0;
    if (inGroup >= PER_TRY) return json({ error: 'limite par essai' }, 429);
    const k = kind(g ?? 'look');
    if (!q.pro && !inGroup && q.used[k] >= FREE[k]) return json({ error: 'quota', kind: k, used: q.used, free: FREE }, 402);
    const r = await fetch('https://api.fashn.ai/v1/run', { method: 'POST', headers: auth, body: JSON.stringify(body) });
    const out = await r.json().catch(() => ({}));
    if (out.id) await admin.from('essais').insert({ user_id: user.id, prediction: out.id, groupe: g });
    return json(out, r.status);
  }
  if (action === 'status' && /^[\w-]+$/.test(id || '')) {
    const r = await fetch('https://api.fashn.ai/v1/status/' + id, { headers: auth });
    return json(await r.json().catch(() => ({})), r.status);
  }
  return json({ error: 'demande invalide' }, 400);
});
