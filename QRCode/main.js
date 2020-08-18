const express = require("express");

const app = express();

const Main = require("./models/Main");

const bodyParser = require("body-parser");

const cors = require("cors");
const { request } = require("../contact");
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization, X-Request-With"
  );
  next();
});

app.use(bodyParser.json());

app.get("/", async (req, res) => {
  try {
    const main = await Main.find();
    res.json(main);
  } catch (err) {
    res.json({ message: err });
  }
});

app.get("/dashboardsearch", async (req, res) => {
  try {
    console.log(req.query);
    const main = await Main.find({ emailq: req.query.emailq });
    res.json(main);
  } catch (err) {
    res.json({ message: err });
  }
});

app.post("/", async (req, res) => {
  // const qrcode = new Main({
  //   nameq: req.body.nameq,
  //   balance: req.body.balance,
  //   emailq: req.body.emailq,
  // });
  const qrcode = new Main({
    encData: req.body.encData,
    emailq: req.body.emailq,
    nameq: req.body.nameq,
    balance: req.body.balance,
    businessName: req.body.businessName,
    charge: req.body.charge,
    emailbusiness: req.body.emailbusiness,
    originalBalance: req.body.balance,
    day: req.body.day,
    month: req.body.month,
    year: req.body.year,
  });

  try {
    const savedQRCode = await qrcode.save();
    res.json(qrcode);
  } catch (err) {
    res.json({ message: err });
  }
});

app.get("/:mainId", async (req, res) => {
  try {
    const main = await Main.findById(req.params.mainId);
    res.json(main);
  } catch (err) {
    res.json({ message: err });
  }
});

app.get("/:mainEncData", async (req, res) => {
  try {
    const main = await Main.findOne({ encData: req.params.mainEncData });
    res.json(main);
  } catch (err) {
    res.json({ message: err });
  }
});

//Delete
app.delete("/:mainId", async (req, res) => {
  try {
    const removedMain = await Main.deleteOne({ _id: req.params.mainId });
    res.json(removedMain);
  } catch (err) {
    res.json({ message: err });
  }
});

app.delete("/delete/:mainEncData", async (req, res) => {
  try {
    const removedMain = await Main.deleteOne({ _id: req.params.mainEncData });
    res.json(removedMain);
  } catch (err) {
    res.json({ message: err });
  }
});

//Update
app.patch("/:mainId", async (req, res) => {
  try {
    // const updatedMain = await Main.updateOne(
    //   { _id: req.params.mainId },
    //   {
    //     $set: {
    //       nameq: req.body.nameq,
    //       balance: req.body.balance,
    //       emailq: req.body.emailq,
    //     },
    //   }
    // );
    const updatedMain = await Main.updateOne(
      { _id: req.params.mainId },
      {
        $set: {
          encData: req.body.encData,
          balance: req.body.balance,
        },
      }
    );
    res.json(updatedMain);
  } catch (err) {
    res.json({ message: err });
  }
});
//Update 2
app.patch("/patch/:mainEncData", async (req, res) => {
  try {
    const updatedMain = await Main.updateOne(
      { encData: req.params.mainEncData },
      {
        $set: {
          encData: req.body.encData,
        },
      }
    );

    res.json(updatedMain);
  } catch (err) {
    res.json({ message: err });
    console.log(err);
  }
});

module.exports = app;
