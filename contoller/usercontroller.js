
const product = require('../model/product')
const Address = require('../model/address')
const address = require('../model/address')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const OTP = require('../model/otp')
const wallet = require('../model/wallet')
const wishlist = require('../model/wishlist')
const category = require('../model/category')
const user = require('../model/users')
const cart = require('../model/cart')
const { render } = require('ejs')
const crypto = require('crypto');
const Coupon = require('../model/coupon')
require("dotenv").config()





const getlanding = async (req, res) => {
    const products = await product.find({ status: false }).sort({ date: -1 }).limit(3)
    res.render('user/landing', { products })
}
const login = (req, res) => {
    console.log(req.query, "query data ")
    req.session.EnteredReferalcode = req.query.id
    res.render('user/login', { err: '' });
}

const securepassword = async (password) => {
    try {
        const passwordhash = await bcrypt.hash(password, 10)
        return passwordhash
    } catch (err) {
        console.log(err.message)
    }

}

const loginpost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;


    try {



        const userExists = await user.findOne({ email: email });
        // const 
        // console.log(userExists.password)

        if (!userExists) {
            return res.render('user/login', { err: 'User not found, try signing in' });
        }


        if (userExists.status === true) {
            return res.render('user/login', { err: 'Your account has been blocked. Contact support team for assistance.' });
        }

        const passwordMatch = await bcrypt.compare(password, userExists.password);

        if (userExists && passwordMatch) {
            // console.log(userExists)
            // const admin=user.findOne({isAdmin:true})
            if (userExists.isAdmin === true) {
                req.session.isAdmin = true;
                res.redirect('/admin/')
            } else {
                req.session.check = req.body.email;
                req.session.isauth = true;
                req.session.email = userExists.email
                res.redirect('/home');

            }
        } else {
            res.render('user/login', { err: 'password not match' })
        }
    } catch (error) {
        console.error(error.message);
    }
};
const signupget = (req, res) => {

    res.render('user/login', { err: '' });
}


const generateRandomString = (length) => {
    return crypto.randomBytes(length).toString('hex');
};
const signuppost = async (req, res) => {
    try {

        const { name, email, phonenumber, password, confirmpassword } = req.body

        if (name.trim() === "") {
            throw Error("name is required")
        }
        if (email.trim() === "") {
            throw Error("email is required")
        }
        if (phonenumber.trim() === "") {
            throw Error("phone number can't be empty")
        }
        if (password.trim() === "") {
            throw Error("invalid password")
        }
        if (password.length < 8) {
            throw Error("Password must contain at least 8 characters");
        }
        if (password !== confirmpassword) {
            throw Error("password doesn't match")
        }
        const letterCount = password.replace(/[^a-zA-Z]/g, '').length;
        if (letterCount < 3) {
            throw Error('Password must contain at least 3 letters')
        }

        const secpass = await securepassword(req.body.password)
        // const email = req.body.email;


        // console.log(req.body);
        const ifexists = await user.findOne({ email: email })


        if (ifexists) {
            res.render('user/login', { err: 'email already exists' })

        } else {




            const data = {
                name: req.body.name,
                password: secpass,
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                status: req.body.status,
                date: Date.now(),
                profileImage: "/photos/default-profile.jpeg",
                Referalcode: generateRandomString(8)

            }


            req.session.data = data
            res.redirect('/otp');

        }
    } catch (error) {
        res.render('user/login', { err: error.message })


    }
}

const gethome = async (req, res) => {
    if (req.session.isauth) {

        const userId = req.query.id
        console.log(userId)
        const products = await product.find({ status: false }).sort({ date: -1 }).limit(8)
        const userdata = await user.findOne({ id: userId })
        // const categorydata=await category.find()
        res.render('user/home', { products, userdata })

    }



}

const productget = (req, res) => {
    console.log('this is the function for get product')
    res.render('user/product')
}

const getprofile = async (req, res) => {

    try {
        const userId = req.session.email;


        const userdata = await user.findOne({ email: userId });
        if (!userdata) {
            throw new Error('User not found');
        }
        res.render('user/profile', { userdata, err: null });
    } catch (error) {
        console.error(error.message);
        res.status(500).render('user/profile', { userdata: null, err: error.message });
    }
}


const getlogout = (req, res) => {
    req.session.isauth = false
    res.redirect('/')
}

const getcheckout = async (req, res) => {

    const users = await user.findOne({ email: req.session.email });
    const userid = users._id
    const defaultaddress = await address.findOne({ userId: userid })
    const email = req.session.email;
    const User = await user.findOne({ email: email })


    const userId = User._id;

    const newcart = await cart.findOne({ userId: userId }).populate("products.productId")

    if (!newcart || newcart.products.length === 0) {
        return res.render('user/cart', {
            title: "cart",
            username: email,
            product: [],
            subtotal: 0,
            total: 0,
            coupon: 0,
            gstAmount: 0,
            totalQuantity: 0,
            User,

        });
    }

    const products = newcart.products;
    let subtotal = 0;
    let totalQuantity = 0;


    newcart.products.forEach(item => {
        if (item.productId && item.productId.price !== undefined) {
            subtotal += item.quantity * item.productId.price;
            totalQuantity += item.quantity;
        } else {
            console.log("Skipping item due to missing or undefined DiscountAmount:", item.productId);
        }
    })
    const gstRate = 0.18;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;


    req.session.totalPrice = total;


    res.render('user/checkout', {
        defaultaddress,
        title: "cart",
        username: email,
        product: products,
        newcart,
        subtotal: subtotal,
        gstAmount: gstAmount.toFixed(2),
        totalQuantity: totalQuantity,
        total: total,
        User,

    })

}




const getforgotpassword = (req, res) => {
    res.render('user/forgotpassword', { err: null })
}

const postforgotpassword = async (req, res) => {
    try {
        const email = req.body.email;
        const userExist = await user.findOne({ email })
        if (!userExist) {
            res.render('user/forgotpassword', { err: 'email not found' })
        } else {
            req.session.data = userExist;
            req.session.forgotOtp = true
            res.redirect('/otp');
        }
    }

    catch (err) {
        console.log("error while forgotpassword", err)

    }
}
const getresetpassword = (req, res) => {
    res.render('user/resetpassword', { err: "" })
}
const postresetpassword = async (req, res) => {
    try {

        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        console.log(newPassword, confirmPassword, "----------");
        if (newPassword !== confirmPassword) {

            return res.render('user/resetpassword', { err: 'Passwords do not match' });
        }
        const passwordhash = await bcrypt.hash(newPassword, 10)
        const email = req.session.data.email;


        const updated = await user.updateOne({ email: email }, { $set: { password: passwordhash } });

        if (updated) {
            req.session.forgotOtp = false;

            req.session.isauth = true;
            const userExists = await user.findOne({ email: email });
            req.session.email = userExists.email


            res.redirect('/home');
        }
    } catch (err) {
        console.log("error while resetting password", err);
        res.status(500).send('Server Error');
    }
};
const getchangepassword = (req, res) => {
    res.render('user/changepassword', { err: null })
}
const postchangepassword = async (req, res) => {
    try {

        const userId = req.session.email;

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const users = await user.findOne({ email: userId });


        const isPasswordValid = await bcrypt.compare(currentPassword, users.password);
        if (!isPasswordValid) {
            return res.render('user/changepassword', { err: 'Current password is incorrect' });
        }


        if (newPassword !== confirmPassword) {
            return res.render('user/changepassword', { err: 'New password and confirm password do not match' });
        }


        if (newPassword.length <= 8) {
            return res.render('user/changepassword', { err: 'Password must be strong' });
        }
        const letterCount = newPassword.replace(/[^a-zA-Z]/g, '').length; // Counting letters in the password
        if (letterCount < 3) {
            return res.render('user/changepassword', { err: 'Password must contain at least 3 letters' });
        }






        const hashedPassword = await bcrypt.hash(newPassword, 10);


        const updatedUser = await user.updateOne({ email: userId }, { $set: { password: hashedPassword } });

        if (updatedUser) {
            res.redirect('/profile');
        } else {
            res.render('user/changepassword', { err: 'Failed to update password' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const getaccountdetials = (req, res) => {
    res.render('user/accountdetails')
}

const geteditdetails = (req, res) => {
    res.render('user/editdetails')
}

const geteditprofile = async (req, res) => {

    const userId = req.session.email


    const userdata = await user.findOne({ email: userId });
    res.render('user/editprofile', { userdata })
}

const posteditprofile = async (req, res) => {
    try {
        const userId = req.session.email;
        const { editName, editPhoneNumber } = req.body;


        if (req.file) {

            const profileImagePath = '/photos/' + req.file.filename;
            await user.updateOne({ email: userId }, { $set: { profileImage: profileImagePath } });
        }



        const updatedUser = await user.updateOne(
            { email: userId },
            { $set: { name: editName, phonenumber: editPhoneNumber } }
        );


        res.redirect('/profile');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
}
const getselectaddress = async (req, res) => {
    try {
        const users = await user.findOne({ email: req.session.email });
        const userid = users._id;
        let totalProductDiscount = 0;
        const defaultaddress = await address.findOne({ userId: userid });
        const email = req.session.email;
        const User = await user.findOne({ email: email });

        const walletBalance = await wallet.findOne({ User_id: users._id });
        const formattedWalletBalance = walletBalance ? walletBalance.Account_balance : 0;

        const userId = User._id;
        const currentDate = new Date();


        const newcart = await cart.findOne({ userId: userId }).populate("products.productId");

        const usedCoupons = users.usedCoupons.map(coupon => coupon.Coupon_code);

        const availableCoupons = await Coupon.find({
            Coupon_code: { $nin: usedCoupons },
            Expirey_date: { $gte: currentDate },
        });

        console.log(availableCoupons, "available coupons for user")
        const coupon = newcart.coupon;
        console.log(coupon, "coupon from select address page");

        let total = 0;

        if (!newcart || newcart.products.length === 0) {
            return res.render('user/cart', {
                title: "cart",
                username: email,
                product: [],
                subtotal: 0,
                TotalPrice: 0,
                coupon: coupon,
                gstAmount: 0,
                availableCoupons: availableCoupons,
                totalQuantity: 0,
                User,
                totalProductDiscount,
                totalWithDiscount: total - totalProductDiscount,
                walletBalance: formattedWalletBalance,
            });
        }

        const products = newcart.products;
        let subtotal = 0;
        let totalQuantity = 0;

        newcart.products.forEach(item => {
            if (item.productId && item.productId.price !== undefined) {
                subtotal += item.quantity * item.productId.price;
                totalQuantity += item.quantity;
            } else {
                console.log("Skipping item due to missing or undefined DiscountAmount:", item.productId);
            }
        });

        const gstRate = 0.18;
        const gstAmount = subtotal * gstRate;
        total = subtotal + gstAmount;

        newcart.products.forEach(item => {
            const { discountprice, discountexpiryDate } = item.productId;
            if (discountexpiryDate && discountexpiryDate > new Date()) {
                totalProductDiscount += Math.floor(discountprice * item.quantity);
            }
        });

        req.session.totalPrice = total;

        res.render('user/selectaddress', {
            defaultaddress,
            title: "cart",
            username: email,
            product: products,
            newcart,
            coupon: coupon,
            subtotal: subtotal,
            gstAmount: gstAmount.toFixed(2),
            totalQuantity: totalQuantity,
            TotalPrice: total,
            availableCoupons: availableCoupons,
            User,
            totalProductDiscount,
            totalWithDiscount: Math.floor(total - totalProductDiscount),
            walletBalance: formattedWalletBalance,
        });
    } catch (error) {
        console.log('Error from getselectaddress:', error);
        res.status(500).send('Internal Server Error');
    }
};


const getproductlist = async (req, res) => {
    const products = await product.find({ status: false })
    res.render('user/productlist', { products })
}



module.exports = { getproductlist, getselectaddress, geteditprofile, posteditprofile, postchangepassword, postresetpassword, getresetpassword, login, loginpost, signupget, signuppost, productget, getlanding, gethome, getprofile, getlogout, getcheckout, getforgotpassword, postforgotpassword, getchangepassword, getaccountdetials, geteditdetails }

