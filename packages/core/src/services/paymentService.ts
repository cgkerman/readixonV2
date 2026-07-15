import crypto from 'crypto';

interface PayTRTokenParams {
  merchantOid: string;
  email: string;
  paymentAmount: number; // in TL (e.g., 19.90)
  userName: string;
  userAddress?: string;
  userPhone?: string;
  userIp: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  basket: Array<[string, string, number]>; // [Item Name, Price (TL), Quantity]
}

export const paymentService = {
  /**
   * Generates a secure token to initialize the PayTR iframe.
   * This MUST be called server-side.
   */
  async generatePayTRToken(params: PayTRTokenParams): Promise<string> {
    const merchant_id = process.env.PAYTR_MERCHANT_ID;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchant_id || !merchant_key || !merchant_salt) {
      throw new Error('PayTR credentials are not configured in environment variables.');
    }

    const {
      merchantOid,
      email,
      paymentAmount,
      userName,
      userAddress = 'Kayıtlı Adres Yok',
      userPhone = '05555555555',
      userIp,
      merchantOkUrl,
      merchantFailUrl,
      basket,
    } = params;

    const payment_amount = Math.round(paymentAmount * 100); // Convert to cents (Kuruş)
    const user_basket = Buffer.from(JSON.stringify(basket)).toString('base64');
    
    // Default values for standard digital integration
    const timeout_limit = '30';
    const debug_on = '1';
    const test_mode = '1'; // Currently in test mode. Set to '0' in production.
    const no_installment = '1'; // Don't show installments
    const max_installment = '0';
    const currency = 'TL';

    // Hash str generation
    const hash_str = `${merchant_id}${userIp}${merchantOid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(hash_str + merchant_salt)
      .digest('base64');

    const formParams = new URLSearchParams({
      merchant_id,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: payment_amount.toString(),
      paytr_token,
      user_basket,
      debug_on,
      no_installment,
      max_installment,
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      timeout_limit,
      currency,
      test_mode,
    });

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });

    if (!response.ok) {
      throw new Error(`PayTR API returned status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return data.token; // Pass this token to iframe
    } else {
      throw new Error(`PayTR API Error: ${data.reason}`);
    }
  },

  /**
   * Verifies the HMAC hash coming from the PayTR webhook.
   */
  verifyPayTRWebhook(postData: any): boolean {
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchant_key || !merchant_salt) return false;

    const { merchant_oid, status, total_amount, hash } = postData;
    const hash_str = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
    
    const calculated_hash = crypto
      .createHmac('sha256', merchant_key)
      .update(hash_str)
      .digest('base64');

    return hash === calculated_hash;
  }
};
