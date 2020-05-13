const express = require("express");

const router = express.Router();

const Blogin = require("../models/Blogin");

const Joi = require("@hapi/joi");

const { BLoginValidation } = require("../validation.js");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

//gets back all the posts
router.get("/", async (req, res) => {
  res.send("Businesses");
});

//submits a post
router.post("/", async (req, res) => {
  //VAILDATION
  const { error } = BLoginValidation(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  //Checking if the emailb exists

  const business = await Blogin.findOne({ emailb: req.body.emailb });
  if (!business) return res.status(404).send("emailb or passwordb is invalid.");
  const { emailb, passwordb, fname, lname } = business;
  //Check if passwordb is correct
  const validPass = await bcrypt.compare(req.body.passwordb, passwordb);
  if (!validPass)
    return res.status(404).send("emailb or passwordb is invalid.");

  //Create and assign a token
  const token = jwt.sign({ _id: business._id }, process.env.TOKEN_SECRET, {
    expiresIn: "3h",
  });

  const stripeId = await Blogin.findOne({ emailb: req.body.emailb });

  const tokenmain = await {
    token: token,
    stripeAccountId: stripeId.stripeAccountId,
  };

  res.header("auth-token", token).send(tokenmain);

  // res.send(stripeId);
});

module.exports = router;
