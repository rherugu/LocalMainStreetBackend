const express = require("express");

const app = express();

const appjs = require("./app");
require("dotenv/config");

app.use("/app", appjs);

app.get("/", (req, res) => {
  res.send("Powered by express © LocalMainStreet 2020");
});

app.listen(process.env.PORT || 3001, "0.0.0.0", () => {
  console.log("mainbackend up and running");
});
