const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uuid = require("uuid/v4");
const helmet = require("helmet");
const Blogin = require("../API/models/Blogin");
const bcrypt = require("bcryptjs");

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

    exports.product = { product };

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

// app.listen(8080, () => console.log("Connected!"));

module.exports = app;
