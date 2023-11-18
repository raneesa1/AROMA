const user = require('../model/users')
const product = require('../model/product')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const OTP = require('../model/otp')

const category = require('../model/category')
require("dotenv").config()




const getlanding = async (req, res) => {
    const products = await product.find({ status: false }).limit(3)
    res.render('landing', { products })
}
const login = (req, res) => {
    res.render('login', { err: '' });
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
        console.log(userExists.password)

        if (!userExists) {
            return res.render('login', { err: 'User not found, try signing in' });
        }


        if (userExists.status === true) {
            return res.render('login', { err: 'Your account has been blocked. Contact support team for assistance.' });
        }

        const passwordMatch = await bcrypt.compare(password, userExists.password);

        if (userExists && passwordMatch) {
            console.log(userExists)
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
            res.render('login', { err: 'password not match' })
        }
    } catch (error) {
        console.error(error.message);
    }
};
const signupget = (req, res) => {

    res.render('login', { err: '' });
}

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
        const letterCount = password.replace(/[^a-zA-Z]/g, '').length; // Counting letters in the password
        if (letterCount < 3) {
            throw Error('Password must contain at least 3 letters')
        }

        const secpass = await securepassword(req.body.password)
        // const email = req.body.email;


        // console.log(req.body);
        const ifexists = await user.findOne({ email: email })


        if (ifexists) {
            res.render('login', { err: 'email already exists' })

        } else {



            const data = {
                name: req.body.name,
                password: secpass,
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                status: req.body.status,
                date: Date.now()
            }
            req.session.data = data
            console.log(data);

            console.log("redirecting to otp")
            res.redirect('/otp');

        }
    } catch (error) {
        res.render('login', { err: error.message })


    }
}

const gethome = async (req, res) => {
    if (req.session.isauth) {
        const userId = req.query.id
        const products = await product.find({ status: false })
        const userdata = await user.findOne({ id: userId })
        // const categorydata=await category.find()
        res.render('home', { products, userdata })

    }
    console.log("reached home");


}

const productget = (req, res) => {
    res.render('product')
}

const getprofile = async (req, res) => {

    const userId = req.session.email


    const userdata = await user.findOne({ email: userId });
    res.render('profile', { userdata })
}


const getlogout = (req, res) => {
    req.session.isauth = false
    res.redirect('/')
}

const getcart = (req, res) => {
    res.render('cart')
}

const getcheckout = (req, res) => {
    res.render('checkout')
}
const getwishlist = (req, res) => {
    res.render('wishlist')
}
const getforgotpassword = (req, res) => {
    res.render('forgotpassword', { err: null })
}

const postforgotpassword = async (req, res) => {
    try {
        const email = req.body.email;
        const userExist = await user.findOne({ email })
        if (!userExist) {
            res.render('forgotpassword', { err: 'email not found' })
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
    res.render('resetpassword')
}
const postresetpassword = async (req, res) => {
    try {
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        console.log(newPassword, confirmPassword, "----------");
        if (newPassword !== confirmPassword) {

            return res.render('resetpassword', { err: 'Passwords do not match' });
        }
        const passwordhash = await bcrypt.hash(newPassword, 10)
        const email = req.session.data.email;


        const updated = await user.updateOne({ email: email }, { $set: { password: passwordhash } });

        if (updated) {
            console.log(updated);
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
    res.render('changepassword', { err: null })
}
const postchangepassword = async (req, res) => {
    try {

        const userId = req.session.email; // Assuming you are using email as a unique identifier

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const users = await user.findOne({ email: userId });

        // Check if the current password is correct
        const isPasswordValid = await bcrypt.compare(currentPassword, users.password);
        if (!isPasswordValid) {
            return res.render('changepassword', { err: 'Current password is incorrect' });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.render('changepassword', { err: 'New password and confirm password do not match' });
        }

        // Check if the password is strong (you can implement your own criteria)
        if (newPassword.length <= 8) {
            return res.render('changepassword', { err: 'Password must be strong' });
        }
        const letterCount = newPassword.replace(/[^a-zA-Z]/g, '').length; // Counting letters in the password
        if (letterCount < 3) {
            return res.render('changepassword', { err: 'Password must contain at least 3 letters' });
        }


        // Retrieve the user from the database


        // Hash the new password before updating the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        const updatedUser = await user.updateOne({ email: userId }, { $set: { password: hashedPassword } });

        if (updatedUser) {
            res.redirect('/profile'); // Redirect to the profile page or any other page after successful password change
        } else {
            res.render('changepassword', { err: 'Failed to update password' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const getaccountdetials = (req, res) => {
    res.render('accountdetails')
}

const geteditdetails = (req, res) => {
    res.render('editdetails')
}

const getmyorder = (req, res) => {
    res.render('myorder')
}

const getaddress = (req, res) => {
    res.render('address')
}

const geteditaddress = (req, res) => {
    res.render('editaddress')
}

const getaddaddress = (req, res) => {
    res.render('addaddress')
}

const getorderdetials = (req, res) => {
    res.render('orderdetials')
}

module.exports = { postchangepassword, postresetpassword, getresetpassword, getorderdetials, login, loginpost, signupget, signuppost, productget, getlanding, gethome, getprofile, getlogout, getcart, getwishlist, getcheckout, getforgotpassword, postforgotpassword, getchangepassword, getaccountdetials, geteditdetails, getmyorder, getaddress, geteditaddress, getaddaddress }

