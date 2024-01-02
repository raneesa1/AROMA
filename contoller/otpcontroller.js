const user = require('../model/users')
const { default: mongoose } = require('mongoose')
const nodemailer = require('nodemailer')
const OTP = require('../model/otp')
const wallet = require('../model/wallet')
require("dotenv").config()




let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,

    }
});

const verifyOtp = async function (req, res) {
    console.log(req.session, "session data from verify otp")
    if (req.session.forgotOtp) {
        const email = req.session.data.email;
        let enteredOtp = req.body.otp;
        const data = req.session.data;
        let { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
        enteredOtp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`
        console.log(enteredOtp, 'combined otp')
        try {
            const storedOtp = await OTP.findOne({ email: email });

            if (storedOtp && storedOtp.otp === enteredOtp) {
                res.redirect('/resetpassword');

            } else {

                res.render('user/otp', { err: 'OTP is incorrect' });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Server Error');

        };
    } else {


        console.log(req.session)
        const email = req.session.data.email;
        let enteredOtp = req.body.otp;
        const data = req.session.data;
        console.log(data, "data of new user")
        let { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
        enteredOtp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`
        console.log(enteredOtp, 'combined otp')
        try {
            const storedOtp = await OTP.findOne({ email: email });

            if (storedOtp && storedOtp.otp === enteredOtp) {

                await new user(data).save();
                const enteredReferralCode = req.session.EnteredReferalcode;
                const referringUser = await user.findOne({ Referalcode: enteredReferralCode });

                if (referringUser) {

                    console.log('inside the if condition of referring user')
                    const referralBonus = 100; 

                    console.log(referralBonus,"bonus amount")
                    console.log(referringUser._id,"id for adding money to wallet")
                    const referringUserWallet = await wallet.findOne({ User_id: referringUser._id });

                    if (!referringUserWallet) {

                        const newWallet = new wallet({
                            User_id: referringUser._id,
                            Account_balance: 0, 
                            Transactions: [],
                        });

                        await newWallet.save();
                    }

                    await wallet.updateOne(
                        { User_id: referringUser._id },
                        {
                            $inc: { Account_balance: referralBonus },
                            $push: {
                                Transactions: {
                                    Amount: referralBonus,
                                    Date: new Date(),
                                    Description: 'Referral Bonus',
                                    Transaction_type: 'credit',
                                },
                            },
                        }
                    );


                    console.log('updated the wallet - bonus')

                    console.log('Referral bonus added to the wallet');
                } else {
                    console.log('Referring user not found');
                }

                req.session.isauth = true;
                const userExists = await user.findOne({ email: email });
                req.session.email = userExists.email


                res.redirect('/home');
            } else {
               
                res.render('user/otp', { err: 'OTP is incorrect' });

            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Server Error');
        }
    };
}
// Function to resend OTP
const resendOtp = function (req, res) {
    const email = req.session.data.email


    var mailOptions = {
        to: email,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + Otp + "</h1>"
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('user/otp', { err: "OTP has been sent" });
    });
};

// Function to send OTP
const sendOtp = async function (req, res) {
    console.log(req.session.data)
    let email = req.session.data.email;

    // console.log(req.body)
    console.log(email, 'emai is there')
    console.log("senitng otp");
    try {
        let otp;
        // Generate new OTP
        let newOtp = Math.floor(100000 + Math.random() * 900000);
        console.log(newOtp, "otp is:");
        let otpexist = await OTP.findOne({ email: email })
        console.log(otpexist);
        if (otpexist) {
            await OTP.deleteOne({ email: email })
        }
        console.log("email is ", email);

        await new OTP({
            email: email,
            otp: newOtp,

        }).save()


        // Send OTP via email


        var mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + newOtp + "</h1>"
        };
        transporter.verify((err, success) => {
            if (err) {

                console.log(err);
            } else {
                console.log("email ready");
            }
        })

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return res.status(500).send(error.toString());
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Redirect to OTP page
            res.render('user/otp', { err: null });
        });
    } catch (err) {
        console.log(err);
    }
};

// const verifyforgotOtp = async function (req, res) {
//     const email = req.session.data.email;
//     let enteredOtp = req.body.otp;
//     const data = req.session.data;
//     let { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
//     enteredOtp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`
//     console.log(enteredOtp, 'combined otp')
//     try {
//         const storedOtp = await OTP.findOne({ email: email });

//         if (storedOtp && storedOtp.otp === enteredOtp) {

//             // OTP is correct, you can proceed with signup
//             // const userExists = await user.findOne({ email: email });
//             // req.session.email = userExists.email


//             res.redirect('/resetpassword');
//         } else {
//             // Incorrect OTP, render the OTP page with an error message
//             res.render('otp', { err: 'OTP is incorrect' });
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).send('Server Error');
//     }
// };



module.exports = { verifyOtp, sendOtp, resendOtp }