//© COPYRIGHT LocalMainStreet 2020
//All rights reserved 2020

const express = require("express");

const mongoose = require("mongoose");

const app = express();

const appjs = require("./app");

const config = require("dotenv/config");
const cors = require("cors");
app.use(cors());

app.use("/app", appjs);

app.get("/", (req, res) => {
  res.send("Powered by express © LocalMainStreet 2020");
});

mongoose.connect(
  String(process.env.DB_CONNECTION),

  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.connection.on("connected", function () {
  console.info("Connected!\n\n");
});
mongoose.connection.on("error", function (err) {
  console.error(`ERROR!!! The error is: ${err}\n\n`);
});
mongoose.connection.on("disconnected", function () {
  console.warn(
    "The connection has been lost. This is because it got disconnected.\n\n"
  );
});

app.listen(process.env.PORT || 3003, "0.0.0.0", () => {
  console.log("mainbackend up and running");
});
