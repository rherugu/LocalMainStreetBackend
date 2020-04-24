const router = require("express").Router();

const verify = require("./verifyToken");

const Blogin = require("../models/Blogin");

const Joi = require("@hapi/joi");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { BusinessValidation } = require("../validation.js");

router.get("/", verify, async (req, res) => {
  try {
    const shops = await Blogin.find();
    res.json(shops);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/", async (req, res) => {
  //VAILDATION
  const { error } = BusinessValidation(req.body);
  if (error)
    return res.send({
      message: error.details[0].message,
    });

  //Checking if the user is already in the database
  const emailExistb = await Blogin.findOne({ emailb: req.body.emailb });
  if (emailExistb)
    return res.send({
      message: "Email already exists. Please choose a different email.",
    });

  //Hashing of the passwords
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(req.body.passwordb, salt);

  const shop = new Blogin({
    emailb: req.body.emailb,
    passwordb: hashedPassword,
    fnameb: req.body.fnameb,
    lnameb: req.body.lnameb,
    bname: req.body.bname,
    description: req.body.description,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    paymentMethod: req.body.paymentMethod,
  });

  try {
    const savedShop = await shop.save();
    res.json({ savedShop, message: "Success!", check: 200 });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
