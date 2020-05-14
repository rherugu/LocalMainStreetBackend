const mongoose = require("mongoose");

const mainschema = mongoose.Schema({
  nameq: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Main", mainschema);
