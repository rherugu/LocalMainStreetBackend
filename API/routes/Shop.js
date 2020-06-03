const router = require("express").Router();

const verify = require("./verifyToken");

const Blogin = require("../models/Blogin");

const Joi = require("@hapi/joi");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Post = require("../models/Post");

const { BusinessValidation } = require("../validation.js");

router.get("/", verify, async (req, res) => {
  try {
    const shops = await Blogin.find();
    res.json(shops);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/:emailb", verify, async (req, res) => {
  try {
    const shops = await Blogin.findOne({ emailb: req.params.emailb });
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
  //Both emails checking
  //Checking if the user is already in the database
  const emailExist = await Post.findOne({ email: req.body.emailb });
  const emailExistb = await Blogin.findOne({ emailb: req.body.emailb });
  if (emailExistb || emailExist)
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
    stripeAccountId: req.body.stripeAccountId,
    website: req.body.website,
  });

  try {
    const savedShop = await shop.save();
    res.json({ savedShop, message: "Success!", check: 200 });
  } catch (err) {
    res.json({ message: err });
  }
});

//Update
router.patch("/:shopId", async (req, res) => {
  try {
    const updatedBlogin = await Blogin.updateOne(
      { _id: req.params.shopId },
      {
        $set: {
          stripeAccountId: req.body.stripeAccountId,
        },
      }
      //   { $set: { lnameq: req.body.lnameq } },
      //   { $set: { balance: req.body.balance } }
    );
    res.json(updatedBlogin);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/search", async (req, res) => {
  const query = req.body.query;

  var result;

  try {
    const regex = new RegExp(`${query}`, "i");
    console.log(regex);
    result = await Blogin.find({
      bname: { $regex: regex },
      // function(err) {
      //   if (err) return err;
      //   console.log(query);
      // },
    });

    res.json({
      result: result,
    });
  } catch (err) {
    console.error(err);
    res.json({
      message: "Error",
      err: err,
      query: query,
    });
  }
});

module.exports = router;
