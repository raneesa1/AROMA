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

        if (!userExists) {
            return res.render('login', { err: 'User not found, try signing in' });
        }


        const passwordMatch = await bcrypt.compare(password, userExists.password);

        if (userExists&&passwordMatch) {
            console.log(userExists)
            // const admin=user.findOne({isAdmin:true})
            if (userExists.isAdmin===true) {
                req.session.isAdmin = true;
                res.redirect('/admin/')
            }else{
                req.session.check = req.body.email;
                req.session.isauth = true;
                res.redirect('/home');

            }
        } else {
            res.render('login', { err:'password not match' })
        }
    } catch (error) {
        console.error(error.message);
    }
};
const signupget = (req, res) => {
    res.render('login', { err: '' });
}

const signuppost = async (req, res) => {

    const secpass = await securepassword(req.body.password)
    const email = req.body.email;

    console.log(req.body);
    const ifexists = await user.findOne({ email: email })


    if (ifexists) {
        res.render('login', { err: 'email already exists' })
    } else {

        try {

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
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
}

const gethome = async (req, res) => {
    if (req.session.isauth) {
        const products = await product.find({ status: false })
        // const categorydata=await category.find()
        res.render('home', { products })

    }
    console.log("reached home");


}

const productget = (req, res) => {
    res.render('product')
}

const getprofile = (req, res) => {
    res.render('profile')
}


const getlogout = (req, res) => {
    req.session.isauth = false
    res.redirect('/')
}



module.exports = { login, loginpost, signupget, signuppost, productget, getlanding, gethome, getprofile, getlogout }

