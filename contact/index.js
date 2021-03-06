var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
var cors = require("cors");
const creds = require("./config");
const Joi = require("@hapi/joi");
const { contactValidation } = require("../API/validation");
const helmet = require("helmet");
const hbs = require("nodemailer-express-handlebars");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.qrCodeSecretKey);

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
// transporter2.use(
//   "compile",
//   hbs({
//     // viewEngine: "express-handlebars",
//     // viewPath: "./views/",
//     viewEngine: {
//       extName: ".hbs",
//       partialsDir: "./contact/views/",
//       layoutsDir: "./contact/views/",
//       defaultLayout: "qrcode.hbs",
//     },
//     viewPath: "./contact/views/",
//     extName: ".hbs",
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
    from: "rherugu@gmail.com",
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
          subject:
            "Submission was successful at the LocalMainStreet Contact Form",
          text:
            "Thank you for contacting us! We are in the process of reading the message. Please allow up to 2 days.\n\n\nFrom, The LocalMainStreet Team",
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
  var bname = req.body.bname;
  var amount = req.body.amount;
  var content = `Hello! Thank you for supporting your local business.\nYou have successfully purchased a gift card/voucher from ${bname} for the amount $${amount}.\n\nRedeem it at ${bname}.\nIn order for you to redeem it, simply go to ${bname}, when you feel comfortable, and show this QRCode to them. Then they will scan it for you.\n\nThats it!\n\nFrom, LocalMainStreet`;

  var mail = {
    from: "info@localmainstreet.com",
    to: email, // Change to email address that you want to receive messages on
    subject: "Gift Card from LocalMainStreet",
    text: content,
    attachments: [
      {
        path: qrcodelink,
      },
    ],
    bcc: "bcclocalmainstreet@gmail.com",
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

router.post("/sendqrcodetoBusiness", (req, res, next) => {
  // const { error } = contactValidation(req.body);
  // if (error) return res.send(error.details[0].message);

  var email = req.body.emailq;
  var amount = req.body.amount;
  var bname = req.body.bname;
  var name = req.body.name;
  var content = `Hello!\nYou have received a payment of $${amount} for your registered business on LocalMainStreet: ${bname}.\nThe voucher has been sent to the customer which they will redeem at a later time.\nUse our LocalMainStreet App to scan the QR Code.\nIf this is your first payment, the payout may take up to 5-7 business days to reach your bank account.`;

  var mail = {
    from: "info@localmainstreet.com",
    to: email, // Change to email address that you want to receive messages on
    subject: "Payment received",
    text: content,
    bcc: "bcclocalmainstreet@gmail.com",
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

router.post("/Bregistration", (req, res, next) => {
  // const { error } = contactValidation(req.body);
  // if (error) return res.send(error.details[0].message);

  var email = req.body.emailq;
  var name = req.body.name;
  console.log(email);
  var content = `Hello, ${name}!\nWelcome to LocalMainStreet! We thank you for registering your business.\n\nPlease download the LocalMainStreet App available in iOS and android. If someone buys a voucher from you, you will need this to redeem it.\n\nIn order to redeem it, if a customer buys a voucher, they will show you a QR Code which you will scan on the app. On the app, first login, then scan it. Then in the textbox, enter the bill that the customer has to pay. Click Submit. If the bill is more than the amount on the voucher, just click the pay full amount button and ask the customer to pay the rest by card, cash, etc. If you need help please contact info@localmainstreet.com.`;

  var mail = {
    from: "info@localmainstreet.com",
    to: email, // Change to email address that you want to receive messages on
    subject: "Welcome to LocalMainStreet!",
    text: content,
    bcc: "bcclocalmainstreet@gmail.com",
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

router.post("/sendqrcodeshare", (req, res, next) => {
  // const { error } = contactValidation(req.body);
  // if (error) return res.send(error.details[0].message);
  var name = req.body.name;
  var bname = req.body.bname;
  var email = req.body.emailq;
  var message = req.body.message;
  var amount = req.body.amount;
  var content = `Hello! ${name} has sent you a gift card/voucher for ${bname} in the amount of $${amount}.\n${name} bought this at LocalMainStreet, a site where you can support local businesses during times of crisis.\n${name} has sent you a message as well!: \n\n${message}\n\nIn order to redeem this gift card, go to the store, ${bname} and ask them to scan this QR Code. That way, your voucher gets redeemed. You can save money for later or use it up immediately.\n\n\nFrom, LocalMainStreet`;

  var mail = {
    from: "info@localmainstreet.com",
    to: email, // Change to email address that you want to receive messages on
    subject: `A Gift from ${name}`,
    text: content,
    attachments: [
      {
        path: qrcodelink,
      },
    ],
    bcc: "bcclocalmainstreet@gmail.com",
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

router.post("/resetPass", (req, res, next) => {
  // const { error } = contactValidation(req.body);
  // if (error) return res.send(error.details[0].message);

  var email = req.body.emailp;
  var key = Math.floor(100000 + Math.random() * 900000);
  var content = `Hello, we are sorry to hear you have lost your password. No worries, you can reset it with this code: ${key}\n\n\nFrom, LocalMainStreet`;

  var mail = {
    from: "info@localmainstreet.com",
    to: email, // Change to email address that you want to receive messages on
    subject: "Reset Password",
    text: content,
  };

  var encKey = cryptr.encrypt(key);

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
        encKey: encKey,
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
