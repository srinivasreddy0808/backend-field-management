// server/controllers/paymentController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

const subscriptionPlans = {
  basic: {
    priceId: "price_H1234567890", // Replace with your actual Stripe price ID
    name: "Basic Plan",
    features: ["Soil Analysis", "Weather Alerts"],
  },
  premium: {
    priceId: "price_H9876543210", // Replace with your actual Stripe price ID
    name: "Premium Plan",
    features: [
      "Soil Analysis",
      "Weather Alerts",
      "AI Predictions",
      "Priority Support",
    ],
  },
};

exports.createSubscription = async (req, res) => {
  try {
    const { priceId } = req.body;
    const user = req.user; // From auth middleware

    // Create a customer if they don't exist
    let customer;
    if (!user.stripeCustomerId) {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });

      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customer.id,
      });
    }

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer?.id || user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error("Subscription creation failed:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object;
      await updateUserSubscription(subscription);
      break;
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      await cancelUserSubscription(deletedSubscription);
      break;
  }

  res.json({ received: true });
};

async function updateUserSubscription(subscription) {
  const user = await User.findOne({
    stripeCustomerId: subscription.customer,
  });

  if (!user) return;

  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: subscription.status,
    subscriptionId: subscription.id,
    subscriptionPlan: getPlanFromPriceId(subscription.items.data[0].price.id),
  });
}

async function cancelUserSubscription(subscription) {
  const user = await User.findOne({
    stripeCustomerId: subscription.customer,
  });

  if (!user) return;

  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: "canceled",
    subscriptionId: null,
    subscriptionPlan: "free",
  });
}
