const express = require("express");

const router = express.Router();

const app = express();

const Users = require("../models/Post");

const bodyParser = require("body-parser");

const Joi = require("@hapi/joi");

const { registerValidation, LoginValidation } = require("../validation.js");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

//gets back all the posts
router.get("/", async (req, res) => {
  try {
    const login = await Users.find();
    res.json(login);
  } catch (err) {
    res.json({ message: err });
  }
});

//submits a post
router.post("/", async (req, res) => {
  //VAILDATION
  const { error } = LoginValidation(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  //Checking if the email exists

  const user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Email or password is invalid.");
  const { email, password, fname, lname } = user;
  //Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, password);
  if (!validPass) return res.status(404).send("Email or password is invalid.");

  //Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "3h",
  });
  res.header("auth-token", token).send(token);

  // res.send('Logged In!');
});

module.exports = router;
