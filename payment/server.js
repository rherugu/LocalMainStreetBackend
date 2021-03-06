const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uuid = require("uuid/v4");
const helmet = require("helmet");
const Blogin = require("../API/models/Blogin");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.qrCodeSecretKey);
const Main = require("../QRCode/models/Main");
const getRawBody = require("raw-body");
var contentType = require("content-type");

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

var nameq;
var emailq;
var balance;

var encryption;
var decryption;

var qrcodeId;

var businessName;
var amountPaid;
var emailbusiness;

var paymentIntent;

var charge;

var donate;

var donation;

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
        description: `Donated to LocalMainStreet`,
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

  const args = new URLSearchParams({
    state,
    client_id: process.env.STRIPE_CLIENT_ID,
  });
  const url = `https://connect.stripe.com/express/oauth/authorize?${args.toString()}&stripe_user[business_type]=company&stripe_user[email]=${email}&stripe_user[phone_number]=${PhoneNumber}&stripe_user[business_name]=${bname}&stripe_user[first_name]=${fname}&stripe_user[last_name]=${lname}&stripe_user[product_description]=${description}`;
  // res.send({ url });
  return res.send({ url });
});

app.get("/authorize-oauth", async (req, res) => {
  const { code, state } = req.query;
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

        return res.redirect(301, "https://localmainstreet.com/Success");
      },
      (err) => {
        if (err.type === "StripeInvalidGrantError") {
          console.log(err);
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

  console.log(object);
  console.log(object.fname);

  return res.send(object);
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

app.post("/donate", (req, res) => {
  donation = req.body.donation * 100;

  console.log("donate", donation);

  return res.json({
    donation: donation,
  });
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const domainURL = req.headers.referer;
    console.log(domainURL);

    const { quantity, locale, product } = await req.body;
    console.log(product.id);
    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address
    // details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [payment_intent_data] - lets capture the payment later
    // [customer_email] - lets you prefill the email input in the form
    // For full details see
    // https://stripe.com/docs/api/checkout/sessions/create

    businessName = product.bname;
    emailbusiness = product.email;
    console.log("rgahav testin f pridasd", product);
    amountPaid = quantity;
    console.log("donation: ", donation);
    var amountone = quantity * 100;

    var finalamount = amountone;
    console.info(finalamount);
    var appFee = Math.ceil(finalamount * 0.029 + 30);
    var newDonation = 100;
    var application_fee_amount = Math.ceil((finalamount + appFee) * 0.029 + 30);
    console.log(appFee);
    var couponbool = false;

    if (product.coupon === true) {
      couponbool = true;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      locale: locale,
      line_items: [
        {
          name: `${product.bname}'s gift card`,
          images: ["https://image.flaticon.com/icons/svg/2331/2331813.svg"],
          quantity: 1,
          currency: process.env.CURRENCY,
          amount: finalamount + application_fee_amount + donation, // Keep the
          // amount on the server to prevent customers
          // from manipulating on client
        },
      ],
      allow_promotion_codes: couponbool,
      payment_intent_data: {
        transfer_data: {
          destination: product.id,
        },
        application_fee_amount: application_fee_amount + donation,
      },
      // ?session_id={CHECKOUT_SESSION_ID}\
      // means the redirect will have the session ID set as a query param
      success_url: `https://localmainstreet.com/Shop?session_id={CHECKOUT_SESSION_ID}`,
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

app.post("/dashboard", (req, res) => {
  idForLink = req.body;

  return res.send(idForLink.stripeAccountId);
});

app.use("/dashboard", cors());

app.get("/dashboardGet", async (req, res) => {
  const link = await stripe.accounts.createLoginLink(req.query.stripeAccountId);

  return res.json({ url: link });
});

app.post("/getInfo", (req, res) => {
  const data = req.body;
  console.log(data);

  nameq = data.nameq;
  console.log(nameq);
  emailq = data.emailq;
  console.log(emailq);
  balance = data.balance;
  console.log(balance);

  res.send("Success!");
});
// app.use(
//   "/webhook",
//   bodyParser.json({
//     verify: (req, res, buf) => {
//       req.rawBody = buf;
//     },
//   })
// );
// app.use("/webhook", function (req, res, next) {
//   getRawBody(
//     req,
//     {
//       length: req.headers["content-length"],
//       limit: "1mb",
//       encoding: contentType.parse(req).parameters.charset,
//     },
//     function (err, string) {
//       if (err) return next(err);
//       req.text = string;
//       console.log(string);
//       next();
//     }
//   );
// });

// app.use("/webhook", bodyParser.urlencoded({ extended: false }));
// Webhook handler for asynchronous events.
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the
      // raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];
      var body = req.body;
      var e;
      console.log(body);
      try {
        // event = stripe.webhooks.constructEvent(
        //   body,
        //   signature,
        //   process.env.STRIPE_WEBHOOK_SECRET
        // );
        // console.log(signature);
        event = body;
      } catch (err) {
        console.error(
          `⚠️  ☣️  ☢️     Webhook signature verification failed. :( \n${err}`
        );
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
      e = event;

      if (e.data.object.id.startsWith("ch")) charge = e.data.object.id;
    } else {
      // Webhook signing is recommended, but if the secret is not
      // configured in `config.js`, retrieve the event data directly
      // from the request body.
      data = req.body.data;
      eventType = req.body.type;
      e = req.body;

      if (e.data.object.id.startsWith("ch")) charge = e.data.object.id;
    }

    if (eventType === "checkout.session.completed") {
      console.log(`🔔  💰  💵  💸  🤑    Payment received!`);

      console.log("charge", charge);
      console.log(emailq);
      console.log(nameq);
      console.log(balance);
      console.log("event!!", e);
      console.log("businessName: ", businessName);
      console.log("amountPaid: ", amountPaid);

      paymentIntent = e.data.object.payment_intent;
      console.info(paymentIntent);
      var d = new Date();

      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      var qrcodeDataParsed = {
        emailq: emailq,
        nameq: nameq,
        balance: balance,
        businessName: businessName,
        charge: charge,
        emailbusiness: emailbusiness,
        originalBalance: balance,
        day: day,
        month: month,
        year: year,
      };
      console.log(emailbusiness);

      console.log(qrcodeDataParsed);

      var qrcodeData = JSON.stringify(qrcodeDataParsed);
      console.log(qrcodeData);

      const encryptedData = cryptr.encrypt(qrcodeData);
      console.log(encryptedData);

      // encryption = encryptedData;

      const qrcode = new Main({
        encData: encryptedData,
        emailq: emailq,
        nameq: nameq,
        balance: balance,
        businessName: businessName,
        charge: charge,
        emailbusiness: emailbusiness,
        originalBalance: balance,
        day: day,
        month: month,
        year: year,
      });

      try {
        const savedQRCode = await qrcode.save();
        console.log(savedQRCode._id);
        encryption = savedQRCode;
        console.log(encryption);
        return res.json(qrcode);
      } catch (err) {
        console.err(err);
        return res.json({ message: err });
      }
    }

    return res.sendStatus(200);
  }
);

app.get("/getId", (req, res) => {
  return res.send(qrcodeId);
});

app.get("/encryption", (req, res) => {
  // if (encryption) {
  //   res.json({
  //     message: encryption,
  //     status: "success",
  //   });
  // } else {
  //   res.json({
  //     message: "User has not bought anthing yet.",
  //     status: "failure",
  //   });
  // }

  enc: if (encryption === undefined || !encryption) {
    return res.json({
      message: "User has not bought anthing yet.",
      status: "failure",
    });
  } else {
    res.json({
      message: encryption,
      status: "success",
      businessName: businessName,
      amountPaid: amountPaid,
      emailbusiness: emailbusiness,
    });
    encryption = undefined;

    break enc;
  }
});

app.post("/encryptionApp", (req, res) => {
  const data = req.body.data;

  const encryption = cryptr.encrypt(data);

  return res.json({
    encryptedData: encryption,
  });
});

app.post("/decryption", (req, res) => {
  const data = req.body.data;

  const decryption = cryptr.decrypt(JSON.parse(data));
  return res.json({
    decryptedData: JSON.parse(decryption),
  });
});

app.get("/refund", async (req, res) => {
  // const refund = await stripe.refunds.create({
  //   payment_intent: paymentIntent,
  //   charge: charge,
  // });
  console.log(charge);
  await stripe.refunds.create({ charge: charge }, function (err, refund) {
    console.error(err);
  });

  return res.send("success");
});

module.exports = app;
