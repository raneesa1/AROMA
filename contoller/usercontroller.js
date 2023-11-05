const user=require('../model/users')
const { default: mongoose } = require('mongoose')
const bcrypt=require('bcrypt')
const { body, } = require('express-validator')


const home=(req,res)=>{
    res.render('landing')
}
const login=(req,res)=>{
    res.render('login', { err: '' });
}

const securepassword=async(password)=>{
    try {
        const passwordhash=await bcrypt.hash(password,10)
        return passwordhash
    } catch (err) {
        console.log(err.message)
    }

}
const loginpost=async(req,res)=>{
    const name=req.body.name
    const password=req.body.password
    const check=await user.findOne({name:name})
    if(!check){
        return res.render('login',{err:'user not found'})
    }
    const passwordmatch=await bcrypt.compare(password,check.password)
    if(passwordmatch){
        req.session.check=req.body.email
        req.session.isauth=true
        res.redirect('/home')

    }else{
        res.render('login',{err:'incorrect username or password'})
    }

}

const signupget=(req,res)=>{
     res.render('home', { err: '' });
}
const signuppost=async(req,res)=>{
    const secpass=await securepassword(req.body.password)
    console.log(req.body)
    const email=req.body.email.toLowerCase()
    const ifexists=await user.findOne({email:email})
    if(ifexists){
        res.render('home',{err:'email already exists'})
    }else{
        const data={
            name:req.body.name,
            password:secpass,
            email:req.body.email,
            date:Date.now()
        }
        await new user(data).save()
        res.redirect('/home')
    }
}

const signupvalidation=[
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phonenumber').isLength({min:10}).withMessage('phone number must be 10 characters long'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
]

const loginvalidation=[
    body('name').not().isEmpty().withMessage('Name is required'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
]


const postloginwithvalidation=(loginvalidation, (req, res) => {
    const err = body(req);
    if (!err.isEmpty()) {
        res.render('login', { err: err.array() });
    } else {
        loginpost(req, res);
    }
})



// Signup GET and POST routes with validation
const postsignupwithvalidation = (signupvalidation, (req, res) => {
    const err = body(req);
    if (!err.isEmpty()) {
        res.render('signup', { err: err.array() });
    } else {
        signuppost(req, res);
    }
})
const gethome=(req,res)=>{
    res.render('home')
}



const productget=(req,res)=>{
    res.render('product')``
}
const cartget=(req,res)=>{
    res.render('cart')
}

module.exports={home,login,loginpost,signupget,signuppost,productget,cartget,gethome,postloginwithvalidation,postsignupwithvalidation}

