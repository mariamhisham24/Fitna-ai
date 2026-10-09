import crypto from 'crypto';

export interface PaymobIntentionParams {
  amount: number; // in cents
  currency: 'EGP' | 'SAR';
  payment_methods: number[];
  billing_data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city?: string;
    country?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
  };
  items: Array<{
    name: string;
    amount: number; // in cents
    description: string;
    quantity: number;
  }>;
  special_reference?: string;
}

export interface PaymobIntentionResponse {
  client_secret: string;
  intention_id: number;
  payment_url: string;
  url: string;
}

export async function createPaymentIntention(params: PaymobIntentionParams): Promise<PaymobIntentionResponse> {
  const secretKey = process.env.PAYMOB_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYMOB_SECRET_KEY is not set');
  }

  const response = await fetch('https://accept.paymob.com/v1/intention/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${secretKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create Paymob intention: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  
  // Construct the payment URL
  const paymentUrl = `https://accept.paymob.com/unifiedcheckout/?tenant=${process.env.PAYMOB_PUBLIC_KEY}&reference=${data.client_secret}`;

  return {
    ...data,
    payment_url: paymentUrl,
    url: paymentUrl,
  };
}

export function verifyHMAC(queryObj: Record<string, any>, hmacSecret: string = process.env.PAYMOB_HMAC_SECRET || ''): boolean {
  if (!hmacSecret) {
    throw new Error('PAYMOB_HMAC_SECRET is not set');
  }

  // Usually Paymob HMAC validation involves sorting the query parameters except hmac itself
  // Paymob docs specify concatenating specific fields for V1 webhook or V2. 
  // Let's implement standard Paymob HMAC verification for webhook bodies.
  // The webhook body object's obj properties need to be concatenated in a specific order:
  // amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order.id, owner, pending, source_data.pan, source_data.sub_type, source_data.type, success
  
  // The provided queryObj here is expected to be the body of the webhook transaction callback
  const { obj } = queryObj;
  
  if (!obj) {
    return false;
  }

  const lexigraphicalString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id || obj.order,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success
  ].join('');

  const hmac = crypto.createHmac('sha512', hmacSecret).update(lexigraphicalString).digest('hex');

  return hmac === queryObj.hmac;
}

export async function getTransaction(transactionId: string) {
  const secretKey = process.env.PAYMOB_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYMOB_SECRET_KEY is not set');
  }

  const response = await fetch(`https://accept.paymob.com/api/acceptance/transactions/${transactionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`, // Note: Transaction retrieval might require different auth, often just passing auth token
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Paymob transaction: ${response.statusText}`);
  }

  return response.json();
}
