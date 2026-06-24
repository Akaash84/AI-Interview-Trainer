const express = require('express');
const router = express.Router();
const braintree = require('braintree');
require('dotenv').config();

// Get client URL from environment or fallback to localhost
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

router.get('/client_token', (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    if (err) {
      console.error('Error generating client token:', err);
      return res.status(500).send({ error: 'Failed to generate client token.' });
    }
    res.status(200).send({ clientToken: response.clientToken });
  });
});

// subscribe.js
router.post("/subscribe", async (req, res) => {
  const { paymentMethodNonce, planId } = req.body;

  try {
    // Step 1: Create customer + vault payment method
    const customerResult = await gateway.customer.create({
      firstName: "Test",
      lastName: "User",
      paymentMethodNonce: paymentMethodNonce,
    });

    if (!customerResult.success) {
      return res.status(400).send({ error: customerResult.message });
    }

    const paymentMethodToken = customerResult.customer.paymentMethods[0].token;

    // Step 2: Create subscription with vaulted token
    const subscriptionResult = await gateway.subscription.create({
      paymentMethodToken: paymentMethodToken,
      planId: planId,
    });

    if (!subscriptionResult.success) {
      return res.status(400).send({ error: subscriptionResult.message });
    }

    res.send({ success: true, subscription: subscriptionResult.subscription });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).send({ error: err.message });
  }
});


router.post('/hosted_checkout', (req, res) => {
  const planId = req.body.planId;
  gateway.plan.find(planId, (err, plan) => {
    if (err) {
      return res.status(500).send({ success: false, message: 'Plan not found.' });
    }

    gateway.transaction.sale({
      amount: plan.price,
      paymentMethodNonce: 'fake-paypal-future-nonce',
      options: {
        submitForSettlement: true,
        paypal: {
          successUrl: `${CLIENT_URL}/success`,
          cancelUrl: `${CLIENT_URL}/cancel`,
        }
      }
    }, (err, result) => {
      if (result.success) {
        res.status(200).send({ success: true, redirectUrl: result.transaction.paypal.redirectUrl });
      } else {
        res.status(500).send({ success: false, message: result.message });
      }
    });
  });
});

module.exports = router;
