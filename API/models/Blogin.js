const mongoose = require("mongoose");

const BloginSchema = mongoose.Schema({
  emailb: {
    type: String,
    required: true,
  },
  passwordb: {
    type: String,
    required: true,
  },
  fnameb: {
    type: String,
    required: true,
  },
  lnameb: {
    type: String,
    required: true,
  },
  bname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  businessCatagory: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  accountHolderType: {
    type: String,
    required: true,
  },
  routingNumber: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Blogin", BloginSchema);
