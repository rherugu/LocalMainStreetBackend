const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Posts", PostSchema);

// const mongoose = require("mongoose");
// var val = 0;

// const PostSchema = mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     fname: {
//       type: String,
//       required: true,
//     },
//     lname: {
//       type: String,
//       required: true,
//     },
//     businesses: [
//       {
//         type: Object,
//         required: false,
//         business: {
//           name: {
//             type: String,
//             required: false,
//           },
//           amount: {
//             type: Number,
//             required: false,
//           },
//         },
//       },
//       { strict: false },
//     ],
//   },
//   { strict: false }
// );

// module.exports = mongoose.model("Posts", PostSchema);
