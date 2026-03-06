const { client } = require('../config/paypal');
const Order = require('../models/Order');
const paypalCheckoutSdk = require('@paypal/checkout-server-sdk');

exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const request = new paypalCheckoutSdk.orders.OrdersCreateRequest();
    request.headers.add('Prefer', 'return=representation');
    request.body = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toString(),
        },
      }],
    };

    const createOrder = await client.execute(request);
    const order = new Order({
      userId: req.userId,
      amount,
      paypalOrderId: createOrder.result.id,
      status: 'pending',
    });
    await order.save();

    res.json({ id: createOrder.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const request = new paypalCheckoutSdk.orders.OrdersCaptureRequest(orderId);
    request.headers.add('Prefer', 'return=representation');

    const capture = await client.execute(request);
    
    await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { status: 'completed' }
    );

    res.json({ status: 'success', capture: capture.result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};