const user=require('../model/users')
const product=require('../model/product')
const { default: mongoose } = require('mongoose')
const bcrypt=require('bcrypt')
const nodemailer = require('nodemailer')
const randomstring = require('randomstring');


const getlanding= async(req,res)=>{
    const products = await product.find().limit(3);
    res.render('landing',{products})
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
    const email=req.body.email
    const password=req.body.password
    const check=await user.findOne({email:email})
    if(!check){
        return res.render('login',{err:'user not found'})
    }
    const passwordmatch= await bcrypt.compare(password,check.password)
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

const signuppost=async (req,res)=>{
    
    const secpass = await securepassword(req.body.password)
    const email=req.body.email.toLowerCase()
    const ifexists=await user.findOne({email:email})
    if(ifexists){
        res.render('login',{err:'email already exists'})
    }else{
        
    
    const data={
        name:req.body.name,
        password:secpass,
        email:req.body.email,
        phonenumber:req.body.phonenumber,
        status:req.body.status,
        date:Date.now()
    }
await new user(data).save()
res.render('home')
}}

const gethome=(req,res)=>{
    res.render('home')

}

const productget=(req,res)=>{
    res.render('product')
}

const cartget=(req,res)=>{
    res.render('cart')
}

module.exports={login,loginpost,signupget,signuppost,productget,cartget,getlanding,gethome}

