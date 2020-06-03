const express = require("express");

const router = express.Router();

const app = express();

const Users = require("../models/Post");

const Blogin = require("../models/Blogin");

const bodyParser = require("body-parser");

const Joi = require("@hapi/joi");

const { BusinessValidation, LoginValidation } = require("../validation.js");

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
  const { errorB } = BusinessValidation(req.body);
  console.log("error", error);
  console.log("errorB", errorB);
  console.log("req.body", req.body);
  if (error || errorB) return res.status(404).send(error.details[0].message);
  try {
    const user = await Users.findOne({ email: req.body.email });
    const userB = await Blogin.findOne({ emailb: req.body.email });
    const stripeId = await Blogin.findOne({ emailb: req.body.email });

    console.log("user", user);
    console.log("userB", userB);
    console.log("stripeId", stripeId);

    if (!user && !userB)
      return res.status(404).send("Email or password is invalid.");

    if (!user) {
      const { emailb, passwordb, fnameb, lnameb } = userB;
      const validPassB = await bcrypt.compare(req.body.password, passwordb);
      if (!validPassB)
        return res.status(404).send("Email or password is invalid.");

      const tokenB = jwt.sign({ _id: userB._id }, process.env.TOKEN_SECRET, {
        expiresIn: "3h",
      });

      const tokenBAndURL = {
        token: tokenB,
        url: "/Dashboard",
        stripeId: stripeId.stripeAccountId,
        emailb: emailb,
        fname: fnameb,
        lname: lnameb,
      };

      res.header("auth-token", tokenB).send(tokenBAndURL);
    } else if (!userB) {
      const { email, password, fname, lname } = user;
      const validPass = await bcrypt.compare(req.body.password, password);
      if (!validPass)
        return res.status(404).send("Email or password is invalid.");

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "3h",
      });

      const tokenBAndURL = {
        token: token,
        url: "/Shop",
        email: email,
        fname: fname,
        lname: lname,
      };

      res.header("auth-token", token).send(tokenBAndURL);
    }
  } catch (error) {
    console.log("ERRORORORORROR)OROR", error);
  }

  // const user = await Users.findOne({ email: req.body.email });
  // const userB = await Blogin.findOne({ emailb: req.body.email });
  // const stripeId = await Blogin.findOne({ emailb: req.body.email });

  // if (!user && !userB)
  //   return res.status(404).send("Email or password is invalid.");

  // if (!user) {
  //   const { emailb, passwordb, fnameb, lnameb } = userB;
  //   const validPassB = await bcrypt.compare(req.body.password, passwordb);
  //   if (!validPassB)
  //     return res.status(404).send("Email or password is invalid.");

  //   const tokenB = jwt.sign({ _id: userB._id }, process.env.TOKEN_SECRET, {
  //     expiresIn: "3h",
  //   });

  //   const tokenBAndURL = {
  //     token: tokenB,
  //     url: "/Dashboard",
  //     stripeId: stripeId.stripeAccountId,
  //   };

  //   res.header("auth-token", tokenB).send(tokenBAndURL);
  // } else if (!userB) {
  //   const { email, password, fname, lname } = user;
  //   const validPass = await bcrypt.compare(req.body.password, password);
  //   if (!validPass)
  //     return res.status(404).send("Email or password is invalid.");

  //   const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
  //     expiresIn: "3h",
  //   });

  //   const tokenBAndURL = {
  //     token: token,
  //     url: "/Shop",
  //     email: email,
  //     fname: fname,
  //     lname: lname,
  //   };

  //   res.header("auth-token", token).send(tokenBAndURL);
  // }

  //Check if password is correct

  // console.log(validPassB);

  // if (!validPass || !validPassB)
  //   return res.status(404).send("Email or password is invalid.");

  //Create and assign a token

  // res.send('Logged In!');
});

module.exports = router;
