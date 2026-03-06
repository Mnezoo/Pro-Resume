const paypalSDK = require('@paypal/checkout-server-sdk');

// PayPal Environment Setup
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// Determine environment (sandbox for testing, live for production)
const environment = process.env.NODE_ENV === 'production' 
  ? new paypalSDK.core.LiveEnvironment(clientId, clientSecret)
  : new paypalSDK.core.SandboxEnvironment(clientId, clientSecret);

const client = new paypalSDK.core.PayPalHttpClient(environment);

module.exports = { client, clientId };