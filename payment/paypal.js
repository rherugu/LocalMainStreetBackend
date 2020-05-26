const express = require("express");

const paypal = require("paypal-rest-sdk");

const server = require("./server");

const cors = require("cors");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AYVDkVTXww1OskXTx9vHFylit0kx4M2cPr_IagnkxD96CBEZiwiE5Hbh7_ICAaWm3OQ2df4DeArxjeIt",
  client_secret:
    "EA-nBtgKwbSWrkLxpFsLPhH8vGQBcfaI3Rk6SSVC6Pw34bh6F1kjZpQt9UGKzocQMHD1R_dIBtHoGFy4",
});

const app = express();
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

app.post("/pay", (req, res) => {
  const { product } = req.body;

  console.log("req.body", req.body);

  console.log("###", product);

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3006/app/payment/paypal/success",
      cancel_url: "http://localhost:3006/app/payment/paypal/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: product.name,
              sku: "001",
              price: product.price,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: product.price,
        },
        description: `Purchased the dsadsa`,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.log(error);
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const { product } = req.body;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: product.price,
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

module.exports = app;
