//© COPYRIGHT LocalMainStreet 2020

const express = require("express");

const app = express();

const BusinessLoginAPI = require("./API/BusinessLoginAPI");
const contact = require("./contact/index");
const payment = require("./payment/server");
const LoginAPI = require("./API/LoginAPI");
const qrcode = require("./QRCode/main");
require("dotenv/config");
const cors = require("cors");
app.use(cors());

app.use("/qrcode", qrcode);
app.use("/BusinessLoginAPI", BusinessLoginAPI);
app.use("/contact", contact);
app.use("/payment", payment);
app.use("/LoginAPI", LoginAPI);

app.get("/", (req, res) => {
  res.send("© LocalMainStreet 2020 Backend server");
});


module.exports = app;
