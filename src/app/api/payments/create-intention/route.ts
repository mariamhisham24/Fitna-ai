import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentIntention } from '@/lib/payments/paymob';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, currency = 'EGP' } = body;

    let amount = 0;
    if (plan === 'individual') {
      amount = 1900; // $19 / 19 EGP? We'll assume cents of whatever currency
    } else {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const firstName = profile?.first_name || 'Fitna';
    const lastName = profile?.last_name || 'User';
    const email = profile?.email || user.email || 'user@fitna.ai';

    const intention = await createPaymentIntention({
      amount,
      currency,
      payment_methods: [parseInt(process.env.PAYMOB_INTEGRATION_ID || '0', 10)],
      billing_data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: '01000000000', // placeholder or real if we have it
      },
      items: [
        {
          name: `${plan} subscription`,
          amount,
          description: `Fitna AI ${plan} subscription`,
          quantity: 1,
        }
      ]
    });

    // Create a pending subscription first
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: plan,
        status: 'pending',
        amount_cents: amount,
        currency,
        paymob_order_id: intention.intention_id.toString(),
      })
      .select()
      .single();
      
    if (subError) throw subError;

    // Create payment record
    const { error: payError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        subscription_id: subData.id,
        amount_cents: amount,
        currency,
        paymob_order_id: intention.intention_id.toString(),
        status: 'pending'
      });

    if (payError) throw payError;

    return NextResponse.json({
      client_secret: intention.client_secret,
      payment_url: intention.payment_url,
    });
  } catch (error: any) {
    console.error('Payment intention error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
