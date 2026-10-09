import { NextResponse } from 'next/server';
import { verifyHMAC } from '@/lib/payments/paymob';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const hmac = url.searchParams.get('hmac');
    const body = await request.json();

    // Verify HMAC
    const queryObj = { hmac, obj: body.obj };
    const isValid = verifyHMAC(queryObj);

    if (!isValid) {
      console.warn('Invalid HMAC signature from Paymob webhook');
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 400 });
    }

    const transaction = body.obj;
    const orderId = transaction.order?.id?.toString() || transaction.order?.toString();
    const isSuccess = transaction.success === true && transaction.pending === false;

    const supabase = createAdminClient();

    // Find the payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('paymob_order_id', orderId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found for order:', orderId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment
    const paymentStatus = isSuccess ? 'success' : 'failed';
    await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        paymob_transaction_id: transaction.id.toString(),
        metadata: transaction
      })
      .eq('id', payment.id);

    // Update subscription
    if (isSuccess && payment.subscription_id) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          expires_at: expiresAt.toISOString(),
          starts_at: new Date().toISOString()
        })
        .eq('id', payment.subscription_id);
    } else if (!isSuccess && payment.subscription_id) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'failed'
        })
        .eq('id', payment.subscription_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Paymob webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
