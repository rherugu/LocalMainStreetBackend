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
  },
  accountHolderName: {
    type: String,
  },
  accountHolderType: {
    type: String,
  },
  routingNumber: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  stripeAccountId: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
});

module.exports = mongoose.model("Blogin", BloginSchema);
