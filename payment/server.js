const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uuid = require("uuid/v4");
const helmet = require("helmet");
const Blogin = require("../API/models/Blogin");
const bcrypt = require("bcryptjs");

var stripeBankInfo;
var stripeRoutingNumber;
var stripeAccountNumber;
var stripeAccountHolderName;
var stripeAccountHolderType;

var email;
var password;
var fname;
var lname;
var bname;
var description;
var address;
var PhoneNumber;
var day;
var month;
var year;

var AccountId;
var Account;
var idForLink;

const app = express();
var compression = require("compression");
app.use(compression()); //Compress all routes
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization, X-Request-With"
  );
  next();
});

// stripe.accounts.create(
//   {
//     type: "custom",
//     country: "US",
//     email: "theherugu@example.com",
//     requested_capabilities: ["card_payments", "transfers"],
//   },
//   function (err, account) {
//     console.log(err);
//   }
// );

const paypal = require("./paypal");
app.use("/paypal", paypal);

app.get("/", (req, res) => {
  res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.get("/checkout", (req, res) => {
  res.send("POST call");
});

app.post("/checkout", async (req, res) => {
  // console.log("Request:", req.body);

  let error;
  let status;
  try {
    const accountLinks = await stripe.accountLinks.create({
      account: "acct_1032D82eZvKYlo2C",
      failure_url:
        "https://images.squarespace-cdn.com/content/v1/5a1ffcef4c0dbf776ccbc5a1/1534837933723-Q40CFTGHVXOESRZFY1YP/ke17ZwdGBToddI8pDm48kF5p5Fi6T9MQS3XGauu7T8dZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZamWLI2zvYWH8K3-s_4yszcp2ryTI0HqTOaaUohrI8PIrQnLfoR4fmphWk35MiuRcUg0qTFGclgUyKxXa8xDp_c/Payment+failed+for+web.png",
      success_url: "https://i.stack.imgur.com/YbIni.png",
      type: "custom_account_verification",
      collect: "eventually_due",
    });

    const { product, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased the ${product.name}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      {
        idempotency_key,
      }
    );

    const database = await Blogin.find();
    console.log("abcdefghijklmnopqrstuvwxyz", database[0].routingNumber);
    // console.log(database);

    const BankAccountToken = await stripe.tokens.create(
      {
        bank_account: {
          country: "US",
          currency: "usd",
          account_holder_name: "Raghav Herugu",
          account_holder_type: "Individual",
          routing_number: "110000000",
          account_number: "000123456789",
        },
      },
      function (err, token) {
        console.error(err);
      }
    );

    console.log("&*&#*(&@(*$&*(@#&$*(@#&", BankAccountToken);

    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});

app.post("/get-oauth-link", async (req, res) => {
  // stripeBankInfo = req.body;
  // console.log(stripeBankInfo);

  // stripeAccountHolderName = stripeBankInfo.accountHolderName;
  // stripeAccountHolderType = stripeBankInfo.accountHolderType;
  // stripeAccountNumber = stripeBankInfo.accountNumber;
  // stripeRoutingNumber = stripeBankInfo.routingNumber;

  // res.send(stripeBankInfo);
  const { code, state } = req.query;

  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code: code,
  });

  var connected_account_id = response.stripe_user_id;
  res.send(connected_account_id);
});

app.get("/get-oauth-link", async (req, res) => {
  const state = uuid();

  // req.session.state = state;
  const args = new URLSearchParams({
    state,
    client_id: process.env.STRIPE_CLIENT_ID,
  });
  const url = `https://connect.stripe.com/express/oauth/authorize?${args.toString()}&stripe_user[email]=${email}&stripe_user[phone_number]=${PhoneNumber}&stripe_user[business_name]=${bname}&stripe_user[first_name]=${fname}&stripe_user[last_name]=${lname}&stripe_user[product_description]=${description}&stripe_user[dob_day]=${day}&stripe_user[dob_month]=${month}&stripe_user[dob_year]=${year}`;
  // res.send({ url });
  return res.send({ url });
});

app.get("/authorize-oauth", async (req, res) => {
  const { code, state } = req.query;
  // // Assert the state matches the state you provided in the OAuth link (optional).
  // if (req.session.state !== state) {
  //   return res
  //     .status(403)
  //     .json({ error: "Incorrect state parameter: " + state });
  // }

  // Send the authorization code to Stripe's API.
  stripe.oauth
    .token({
      grant_type: "authorization_code",
      code,
      assert_capabilities: ["transfers"],
    })
    .then(
      async (response) => {
        var connected_account_id = response.stripe_user_id;
        console.log("connected account id", connected_account_id);
        console.log("#####", response);
        console.log("3");
        saveAccountId(connected_account_id);

        Account = connected_account_id;

        // const id = database[database.length - 1]._id;

        // const updatedShop = await Blogin.updateOne(
        //   { _id: id },
        //   {
        //     $set: {
        //       stripeAccountId: connected_account_id,
        //     },
        //   }
        //   //   { $set: { lnameq: req.body.lnameq } },
        //   //   { $set: { balance: req.body.balance } }
        // );

        // Render some HTML or redirect to a different page.

        // const account = await stripe.accounts.create({
        //   country: "US",
        //   type: "custom",
        //   requested_capabilities: ["card_payments", "transfers"],
        // });

        // const accountLinks = await stripe.accountLinks.create({
        //   account: connected_account_id,
        //   failure_url: "https://example.com/failure",
        //   success_url: "https://example.com/success",
        //   type: "custom_account_verification",
        //   collect: "eventually_due",
        // });
        return res.redirect(301, "http://localhost:3000/Success");
      },
      (err) => {
        if (err.type === "StripeInvalidGrantError") {
          return res
            .status(400)
            .json({ error: "Invalid authorization code: " + code });
        } else {
          return res.status(500).json({ error: "An unknown error occurred." });
        }
      }
    );
});

app.get("/stripeAccountId", (req, res) => {
  res.send(Account);
});

app.post("/data", async (req, res) => {
  const object = req.body.data;

  email = object.email;
  password = object.password;
  fname = object.fname;
  lname = object.lname;
  bname = object.bname;
  description = object.description;
  address = object.address;
  PhoneNumber = object.phoneNumber;
  day = Number(object.day);
  month = Number(object.month);
  year = Number(object.year);

  console.log(object);
  console.log(object.fname);
});

app.post("/authorize-oauthpost", async (req, res) => {
  const webhook = req.body;

  console.log(webhook);
});

const saveAccountId = (id) => {
  // Save the connected account ID from the response to your database.
  console.log("Connected account ID: " + id);

  AccountId = id;
};

const { resolve } = require("path");
// Copy the .env.example in the root into a .env file in this folder
require("dotenv").config({ path: "./.env" });

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get("/config", (req, res) => {
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    basePrice: process.env.BASE_PRICE,
    currency: process.env.CURRENCY,
  });
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  try {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send(session);
  } catch (err) {
    console.log(err);
  }
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const domainURL = req.headers.referer;

    const { quantity, locale, product } = await req.body;
    console.log(product.id);
    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [payment_intent_data] - lets capture the payment later
    // [customer_email] - lets you prefill the email input in the form
    // For full details see https://stripe.com/docs/api/checkout/sessions/create

    const session = await stripe.checkout.sessions.create({
      payment_method_types: process.env.PAYMENT_METHODS.split(", "),
      locale: locale,
      line_items: [
        {
          name: `${product.bname}'s gift card`,
          images: ["https://image.flaticon.com/icons/svg/2331/2331813.svg"],
          quantity: 1,
          currency: process.env.CURRENCY,
          amount: quantity * 100, // Keep the amount on the server to prevent customers from manipulating on client
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: product.id,
        },
      },
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}`,
    });

    // stripe.transfers.create(
    //   {
    //     amount: quantity * 100,
    //     currency: process.env.CURRENCY,
    //     destination: "acct_1GgFgCEzJ9ZSYH6H",
    //     transfer_group: "ORDER_95",
    //   },
    //   function (err, transfer) {
    //     console.log(err);
    //   }
    // );

    res.send({
      sessionId: session.id,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/dashboard", async (req, res) => {
  idForLink = await req.body;

  return console.log(idForLink);
});

app.get("/dashboard", async (req, res) => {
  const link = await stripe.accounts.createLoginLink(idForLink.stripeAccountId);

  return res.send(link);
});

// Webhook handler for asynchronous events.
app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

// app.listen(8080, () => console.log("Connected!"));

module.exports = app;
