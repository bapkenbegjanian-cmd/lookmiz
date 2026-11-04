// Fonction Supabase « paiement » de Lookmiz.
// Crée la page de paiement Stripe d'une carte (1,20 € + 0,60 € par personne ajoutée),
// puis vérifie le paiement au retour et active la carte.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const SK = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SITE = 'https://lookmiz.com/';

async function stripe(path: string, body?: URLSearchParams) {
  const r = await fetch('https://api.stripe.com/v1/' + path, {
    method: body ? 'POST' : 'GET', body,
    headers: { Authorization: 'Bearer ' + SK, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (!SK) return json({ error: 'paiement non configuré' }, 500);
  const { action, id, cle, sid } = await req.json().catch(() => ({}));
  if (!/^[a-z0-9]{10,20}$/.test(id || '')) return json({ error: 'carte invalide' }, 400);
  const { data: carte } = await admin.from('cartes').select('cle, data, paid').eq('id', id).maybeSingle();
  if (!carte) return json({ error: 'carte introuvable' }, 404);

  if (action === 'checkout') {
    if (carte.cle !== cle) return json({ error: 'refusé' }, 403);
    if (carte.paid) return json({ paid: true });
    const dest = Array.isArray(carte.data?.f?.dest) ? carte.data.f.dest.length : 0;
    const extra = Math.max(0, dest - 1);            // 1,20 € la carte, puis 0,60 € par personne ajoutée
    const p = new URLSearchParams({
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': '120',
      'line_items[0][price_data][product_data][name]': 'Carte Lookmiz animée',
      success_url: SITE + '?paye=' + id + '&sid={CHECKOUT_SESSION_ID}',
      cancel_url: SITE + '#mes-cartes',
      'metadata[carte]': id,
    });
    if (extra) { p.set('line_items[1][quantity]', String(extra)); p.set('line_items[1][price_data][currency]', 'eur'); p.set('line_items[1][price_data][unit_amount]', '60'); p.set('line_items[1][price_data][product_data][name]', 'Personne supplémentaire'); }
    const s = await stripe('checkout/sessions', p);
    if (!s.url) return json({ error: s.error?.message || 'Stripe a refusé' }, 502);
    return json({ url: s.url });
  }

  if (action === 'verify') {
    if (carte.paid) return json({ paid: true });
    if (!/^cs_[A-Za-z0-9_]+$/.test(sid || '')) return json({ paid: false });
    const s = await stripe('checkout/sessions/' + sid);
    const ok = s.payment_status === 'paid' && s.metadata?.carte === id;
    if (ok) await admin.from('cartes').update({ paid: true }).eq('id', id);
    return json({ paid: ok });
  }
  return json({ error: 'demande invalide' }, 400);
});
