const express = require("express");

const mongoose = require("mongoose");

const router = express.Router();

const app = express();

const Post = require("../models/Post");

const Blogin = require("../models/Blogin");

const bodyParser = require("body-parser");

const Joi = require("@hapi/joi");

const { registerValidation, LoginValidation } = require("../validation.js");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

// mongoose.connect(
//   process.env.DB_CONNECTION,

//   { useNewUrlParser: true, useUnifiedTopology: true },

//   () =>
//     console.log(
//       "Connection to the MongoDB server-side database was successful. POSTS"
//     )
// );

//gets back all the posts
router.get("/", async (req, res) => {
  console.log("hihihi");
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.json({ message: err });
  }
});

//submits a post
router.post("/", async (req, res) => {
  //VAILDATION
  const { error } = registerValidation(req.body);
  if (error) return res.send(error.details[0].message);

  //Checking if the user is already in the database
  const emailExist = await Post.findOne({ email: req.body.email });
  const emailExistB = await Blogin.findOne({ emailb: req.body.email });
  if (emailExist || emailExistB)
    return res.send("Email already exists. Please choose a different email.");

  //Hashing of the passwords
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // console.log(req.body);
  // const { email } = req.body
  // console.log(email)

  const post = new Post({
    email: req.body.email,
    password: hashedPassword,
    fname: req.body.fname,
    lname: req.body.lname,
  });

  try {
    const savedPost = await post.save();
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

// router.post('/')

//specific post
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

//Delete Post
router.delete("/:postId", async (req, res) => {
  try {
    try {
      const removedPost = await Post.deleteOne({ _id: req.params.postId });
      res.json(removedPost);
    } catch (error) {
      const removedPost = await Blogin.deleteOne({ _id: req.params.postId });
      res.json(removedPost);
    }
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/getId", async (req, res) => {
  var email = req.body.emailf;
  console.log(email);

  try {
    const emailfb = await Blogin.findOne({ emailb: email });
    const emailfcu = await Post.findOne({ email: email });

    if (emailfb) {
      console.log(emailfb);
      res.json({ emailp: emailfb });
    } else {
      console.log(emailfcu);
      res.json({ emailp: emailfcu });
    }
  } catch (error) {
    res.json({ message: err });
  }
});

//Update a post
router.patch("/:postId", async (req, res) => {
  try {
    try {
      const updatedPost = await Post.updateOne(
        { _id: req.params.postId },
        {
          $set: {
            password: req.body.passwordf,
          },
        }
      );
      res.json(updatedPost);
    } catch (error) {
      console.log(error);
    }
    try {
      const updatedBlogin = await Blogin.updateOne(
        { _id: req.params.postId },
        {
          $set: {
            passwordb: req.body.passwordf,
          },
        }
      );
      res.json(updatedBlogin);
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
