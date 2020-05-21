var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
var cors = require("cors");
const creds = require("./config");
const Joi = require("@hapi/joi");
const { contactValidation } = require("../API/validation");
const helmet = require("helmet");
const hbs = require("nodemailer-express-handlebars");
var phoneNumber;

require("dotenv/config");
// const accountSid = process.env.accountSid;
// const authToken = process.env.authToken;
// const client = require("twilio")(accountSid, authToken);

// client.messages.create({
//   to: "+17328038584",
//   from: "+12513129817",
//   body: "test",
// });

var compression = require("compression");

var qrcodelink;

router.use(compression()); //Compress all routes
router.use(helmet());

router.get("/", (req, res) => {
  res.send("Contact form");
});

router.get("/send", (req, res) => {
  res.send("Contact form POST REQUEST for /send");
});

// var transport = {
//   service: "gmail",
//   host: "smtp.gmail.com", // Don’t forget to replace with the SMTP host of your provider
//   port: 587,
//   auth: {
//     user: creds.USER,
//     pass: creds.PASS,
//   },
// };

var transport2 = {
  // service: "gmail",
  host: "smtp.zoho.eu", // Don’t forget to replace with the SMTP host of your provider
  port: 465,
  secure: true,
  auth: {
    user: creds.USER,
    pass: creds.PASS,
  },
};

// var transporter = nodemailer.createTransport(transport);
var transporter2 = nodemailer.createTransport(transport2);

// transporter.use(
//   "compile",
//   hbs({
//     // viewEngine: "express-handlebars",
//     viewEngine: {
//       extName: "express-handlebars",
//       partialsDir: "./views/",
//       layoutsDir: "./views/",
//       defaultLayout: "email.body.hbs",
//     },
//     viewPath: "./views/",
//     extName: "express-handlebars",
//   })
// );

transporter2.verify((error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Server is ready to take messages");
  }
});

router.post("/send", (req, res, next) => {
  const { error } = contactValidation(req.body);
  if (error) return res.send(error.details[0].message);

  var name = req.body.name;
  var email = req.body.emailc;
  var message = req.body.message;
  var content = `name: ${name} \n email: ${email} \n message: ${message} `;

  var mail = {
    from: email,
    to: "info@localmainstreet.com", // Change to email address that you want to receive messages on
    subject: "New Message from LocalMainStreet Contact Form",
    text: content,
  };

  transporter2.sendMail(mail, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "success",
      });
      transporter2.sendMail(
        {
          from: "info@localmainstreet.com",
          to: email,
          subject: "Submission was successful",
          text:
            "Thank you for contacting us! We appreciate your feedback and will strive to get better!",
        },
        function (error, info) {
          if (error) {
            console.error(error);
          } else {
            console.log("Message sent: " + info.response);
          }
        }
      );
    }
  });
});

router.post("/getqrcode", (req, res) => {
  qrcodelink = req.body.qrcode;

  return res.send("Success!");
});

router.post("/sendqrcode", (req, res, next) => {
  // const { error } = contactValidation(req.body);
  // if (error) return res.send(error.details[0].message);

  var email = req.body.emailq;
  var content = `Hello! You have bought a QR Code in localmainstreet.com.`;

  var mail = {
    from: "info@localmainstreet.com",
    to: email, // Change to email address that you want to receive messages on
    subject: "QR Code",
    text: content,
    attachments: [
      {
        path: qrcodelink,
      },
    ],
    // template: "qrcode",
  };

  transporter2.sendMail(mail, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        status: "fail",
        err: err,
      });
    } else {
      res.json({
        status: "success",
      });
    }
  });
});

router.post("/phone", (req, res) => {
  phoneNumber = req.body.phone;
  // try {
  var TMClient = require("textmagic-rest-client");
  var c = new TMClient("raghavherugu", "FXHBVMB4bVCsbWq8l2yKa2iFCxakzO");

  c.Messages.send(
    {
      text: `Here is your url for the QR Code: ${qrcodelink}`,
      phones: `+1${phoneNumber}`,
    },
    function (err, res) {
      console.log("Messages.send()", err, res);
    }
  );
  // } catch (err) {
  //   return res.send(err);
  // }

  return res.send(phoneNumber);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);
// app.listen(3009);

module.exports = app;
