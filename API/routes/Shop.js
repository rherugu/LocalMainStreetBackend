const router = require("express").Router();

const verify = require("./verifyToken");

const Blogin = require("../models/Blogin");

const Joi = require("@hapi/joi");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Post = require("../models/Post");

const { BusinessValidation } = require("../validation.js");

router.get("/", async (req, res) => {
  try {
    const shops = await Blogin.find();
    res.json(shops);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/pagination", async (req, res) => {
  try {
    const perPage = 17;

    let page = req.headers.page;
    // Select the 1st - 17th document
    var results = await Blogin.find()
      .skip(page * perPage)
      .limit(perPage);

    res.json(results);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/count", async (req, res) => {
  try {
    Blogin.countDocuments({}, (err, count) => {
      console.log(count);
      res.json(count);
    });
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
    lat: req.body.lat,
    lng: req.body.lng,
    city: req.body.city,
    zipCode: req.body.zipCode,
    coupon: req.body.coupon,
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

router.patch("/email/:shopEmail", async (req, res) => {
  try {
    const updatedBlogin = await Blogin.updateOne(
      { emailb: req.params.shopEmail },
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
  var result1;
  var result2;

  var array = [];

  try {
    const regex = new RegExp(`${query}`, "i");
    result = await Blogin.find({
      bname: { $regex: regex },
      // function(err) {
      //   if (err) return err;
      //   console.log(query);
      // },
    });
    if (result !== undefined || null || NaN || "" || {} || []) {
      array = array.concat(result);
    }
    if (result === undefined || null || NaN || "" || {} || []) {
      result1 = await Blogin.find({
        city: { $regex: regex },
        // function(err) {
        //   if (err) return err;
        //   console.log(query);
        // },
      });
      if (result1 !== undefined || null || NaN || "" || {} || []) {
        array = array.concat(result1);
      }
    }
    if (result1 === undefined || null || NaN || "" || {} || []) {
      result2 = await Blogin.find({
        zipCode: { $regex: regex },
        // function(err) {
        //   if (err) return err;
        //   console.log(query);
        // },
      });
      console.log("fjdsj");
      if (result2 !== undefined || null || NaN || "" || {} || []) {
        array = array.concat(result2);
      }
    }
    console.log(array);
    res.json({
      results: array,
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
