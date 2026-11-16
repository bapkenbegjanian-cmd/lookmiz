// Fonction Supabase « paiement- » de Lookmiz.
// 1) Programmes de 30 jours : page de paiement Stripe (prog_checkout), vérification (prog_verify)
//    et livraison du contenu des jours, seulement si le paiement est confirmé (prog_day).
// 2) Anciennes cartes d'invitation (checkout / verify) : inchangé.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const SK = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SITE = 'https://lookmiz.com/';
// Prix côté serveur : le navigateur ne peut pas les modifier.
// Contenu des 4 programmes : jamais envoyé sans paiement confirmé.
const DAYS: Record<string, { kit: unknown; days: unknown[] }> = __DAYS__;
const okPaid = (s: any) => s.payment_status === 'paid' || s.payment_status === 'no_payment_required';
const PROGS: Record<string, { cents: number; name: string }> = {
  'ecrans': { cents: 999, name: 'Écrans et réseaux (30 jours)' },
  'pornographie': { cents: 999, name: 'Pornographie (30 jours)' },
  'jeux-d-argent': { cents: 999, name: 'Jeux d\'argent et paris (30 jours)' },
  'vape-tabac': { cents: 999, name: 'Vape et tabac (30 jours)' },
  'cannabis': { cents: 999, name: 'Cannabis (30 jours)' },
  'drogues-de-soiree': { cents: 999, name: 'Cocaïne et drogues de soirée (30 jours)' },
  'pack': { cents: 2499, name: 'Les 6 programmes' },
};

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
  const body = await req.json().catch(() => ({}));
  const { action, id, cle, sid } = body;

  if (action === 'prog_checkout') {
    const prog = String(body.prog || ''), P = PROGS[prog];
    if (!P) return json({ error: 'demande invalide' }, 400);
    const p = new URLSearchParams({
      mode: 'payment', locale: 'fr', allow_promotion_codes: 'true',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': String(P.cents),
      'line_items[0][price_data][product_data][name]': 'Lookmiz · ' + P.name,
      success_url: SITE + 'app/?achat=1&sid={CHECKOUT_SESSION_ID}',
      cancel_url: SITE + (prog === 'pack' ? '#tarifs' : 'programmes/' + prog + '/#achat'),
      'metadata[prog]': prog,
    });
    const s = await stripe('checkout/sessions', p);
    if (!s.url) return json({ error: s.error?.message || 'Stripe a refusé' }, 502);
    return json({ url: s.url });
  }
  if (action === 'prog_verify') {
    if (!/^cs_[A-Za-z0-9_]+$/.test(String(sid || ''))) return json({ paid: false });
    const s = await stripe('checkout/sessions/' + sid), prog = s.metadata?.prog;
    return json(okPaid(s) && prog && PROGS[prog] ? { paid: true, prog } : { paid: false });
  }
  if (action === 'prog_day') {
    const prog = String(body.prog || ''), list = Array.isArray(body.sids) ? body.sids.slice(0, 5) : [];
    if (!DAYS[prog]) return json({ error: 'programme inconnu' }, 400);
    for (const one of list) {
      if (!/^cs_[A-Za-z0-9_]+$/.test(String(one))) continue;
      const s = await stripe('checkout/sessions/' + one), pr = s.metadata?.prog;
      if (okPaid(s) && (pr === prog || pr === 'pack')) return json({ days: DAYS[prog].days, kit: DAYS[prog].kit });
    }
    return json({ error: 'accès refusé' }, 403);
  }

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
