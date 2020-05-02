// const express = require("express");

// const paypal = require("paypal-rest-sdk");

// paypal.configure({
//   mode: "sandbox", //sandbox or live
//   client_id:
//     "AaU8tQfmz1_MFDTKuf84yYERXvdDt2ZFJVrxhNW_49DazF4A_F0VBuKyV5_nntyEdZqUa5Oq9ZBj65GVAYVDkVTXww1OskXTx9vHFylit0kx4M2cPr_IagnkxD96CBEZiwiE5Hbh7_ICAaWm3OQ2df4DeArxjeIt",
//   client_secret:
//     "EA-nBtgKwbSWrkLxpFsLPhH8vGQBcfaI3Rk6SSVC6Pw34bh6F1kjZpQt9UGKzocQMHD1R_dIBtHoGFy4",
// });

// const app = express();
// const { product } = req.body;

// app.post("/pay", (req, res) => {
//   const create_payment_json = {
//     intent: "sale",
//     payer: {
//       payment_method: "paypal",
//     },
//     redirect_urls: {
//       return_url: "http://localhost:3006/app/payment/paypal/success",
//       cancel_url: "http://localhost:3006/app/payment/paypal/cancel",
//     },
//     transactions: [
//       {
//         item_list: {
//           items: [
//             {
//               name: product.name,
//               sku: "001",
//               price: product.price,
//               currency: "USD",
//               quantity: 1,
//             },
//           ],
//         },
//         amount: {
//           currency: "USD",
//           total: product.price,
//         },
//         description: `Purchased the ${product.name}`,
//       },
//     ],
//   };

//   paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//       throw error;
//     } else {
//       for (let i = 0; i < payment.links.length; i++) {
//         if (payment.links[i].rel === "approval_url") {
//           res.redirect(payment.links[i].href);
//         }
//       }
//     }
//   });
// });

// app.get("/success", (req, res) => {
//   const payerId = req.query.PayerID;
//   const paymentId = req.query.paymentId;

//   const execute_payment_json = {
//     payer_id: payerId,
//     transactions: [
//       {
//         amount: {
//           currency: "USD",
//           total: product.price,
//         },
//       },
//     ],
//   };

//   paypal.payment.execute(paymentId, execute_payment_json, function (
//     error,
//     payment
//   ) {
//     if (error) {
//       console.log(error.response);
//       throw error;
//     } else {
//       console.log(JSON.stringify(payment));
//       res.send("Success");
//     }
//   });
// });

// app.get("/cancel", (req, res) => res.send("Cancelled"));

// module.exports = app;
