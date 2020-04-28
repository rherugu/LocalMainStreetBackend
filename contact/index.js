var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
var cors = require("cors");
const creds = require("./config");
const Joi = require("@hapi/joi");
const { contactValidation } = require("../API/validation");
const helmet = require("helmet");
var compression = require("compression");

router.use(compression()); //Compress all routes
router.use(helmet());

router.get("/", (req, res) => {
  res.send("Contact form");
});

router.get("/send", (req, res) => {
  res.send("Contact form POST REQUEST for /send");
});

var transport = {
  service: "zoho",
  host: "smtp.zoho.eu", // Don’t forget to replace with the SMTP host of your provider
  port: 587,
  auth: {
    user: creds.USER,
    pass: creds.PASS,
  },
};

var transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
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
    from: name,
    to: "info@localmainstreet.com", // Change to email address that you want to receive messages on
    subject: "New Message from LocalMainStreet Contact Form",
    text: content,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "success",
      });
      transporter.sendMail(
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

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);
// app.listen(3009);

module.exports = app;
