require("dotenv").config();
const { ObjectId } = require("mongodb");
const user = require("../model/users");
const KEY_ID = process.env.RAZORPAY_KEYID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const Razorpay = require("razorpay");


// module.exports = {
//     createRazorpayOrder: (order) => {
//         return new Promise((resolve, reject) => {
//             const razorpay = new Razorpay({
//                 key_id: KEY_ID,
//                 key_secret: KEY_SECRET
//             });



//             const razorpayOrder = razorpay.orders.create({

//                 amount: order.amount,
//                 currency: 'INR',
//                 receipt: order.receipt,
//             });
//             resolve(razorpayOrder);
//         })
//     }
// };
