// Fonction Supabase « stripe-webhook » de Cabine.
// Stripe l'appelle après chaque paiement, renouvellement ou résiliation : on met à jour la table « abonnes ».
import Stripe from 'npm:stripe@14.25.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe('sk_inutilise', { apiVersion: '2024-04-10' });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature') || '';
  const raw = await req.text();
  let event;
  try { event = await stripe.webhooks.constructEventAsync(raw, sig, secret); }
  catch { return new Response('signature invalide', { status: 400 }); }
  const o: any = event.data.object;

  // Premier paiement : on relie le compte Cabine (client_reference_id) à l'abonnement Stripe
  if (event.type === 'checkout.session.completed' && o.client_reference_id) {
    await admin.from('abonnes').upsert({ user_id: o.client_reference_id, stripe_customer: o.customer, stripe_sub: o.subscription,
      // durée payée : un an pour la formule annuelle (79,99 €), sinon un mois ; Stripe la précise ensuite à chaque renouvellement
      fin: new Date(Date.now() + ((o.amount_total ?? 0) >= 5000 ? 367 : 32) * 86400000).toISOString() });
  }
  // Renouvellement, changement ou résiliation : la date de fin suit celle de Stripe
  if (event.type.startsWith('customer.subscription.')) {
    const fin = event.type === 'customer.subscription.deleted' || o.status === 'canceled' || o.status === 'unpaid'
      ? new Date().toISOString()
      // selon la version de l'API Stripe, la fin de période est sur l'abonnement ou sur sa première ligne
      : new Date(((o.current_period_end ?? o.items?.data?.[0]?.current_period_end) || Date.now() / 1000 + 32 * 86400) * 1000).toISOString();
    await admin.from('abonnes').update({ fin, stripe_sub: o.id }).eq('stripe_customer', o.customer);
  }
  return new Response('ok');
});
