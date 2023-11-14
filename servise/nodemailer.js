const nodemailer = require('nodemailer')
require('dotenv').config()


// // Function to send OTP
// const sendOtp = async function (req, res) {
//     console.log(req.session.data)
//     let email = req.session.data.email;

//     // console.log(req.body)
//     console.log(email, 'emai is ther')
//     console.log("senitng otp");
//     try {
//         let otp;
//         // Generate new OTP
//         let newOtp = Math.floor(100000 + Math.random() * 900000);
//         console.log(newOtp, "otp is:");
//         let otpexist = await OTP.findOne({ email: email })
//         if (otpexist) {
//             await OTP.deleteOne({ email: email })
//         }
//         await OTP({ otp: newOtp, email: email }).save();

//         // Send OTP via email

//         var mailOptions = {
//             from: process.env.AUTH_EMAIL,
//             to: email,
//             subject: "Otp for registration is: ",
//             html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + newOtp + "</h1>"
//         };
//         transporter.verify((err, success) => {
//             if (err) {

//                 console.log(err);
//             } else {
//                 console.log("email ready");
//             }
//         })

//         transporter.sendMail(mailOptions, (error, info) => {

//             if (error) {
//                 return res.status(500).send(error.toString());
//             }
//             console.log('Message sent: %s', info.messageId);
//             console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

//             // Redirect to OTP page
//             res.render('otp');
//         });
//     } catch (err) {
//         console.log(err);
//     }
// };


module.exports = {
    sendOtp,
}