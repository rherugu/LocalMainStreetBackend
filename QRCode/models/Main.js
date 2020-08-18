const mongoose = require("mongoose");

const mainschema = mongoose.Schema({
  encData: {
    type: String,
    required: true,
  },
  emailq: {
    type: String,
  },
  nameq: {
    type: String,
  },
  balance: {
    type: Number,
  },
  businessName: {
    type: String,
  },
  charge: {
    type: String,
  },
  emailbusiness: {
    type: String,
  },
  originalBalance: {
    type: Number,
  },
  day: {
    type: Number,
  },
  month: {
    type: Number,
  },
  year: {
    type: Number,
  },
});

module.exports = mongoose.model("Main", mainschema);
