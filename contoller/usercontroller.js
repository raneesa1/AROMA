const user=require('../model/users')
const { default: mongoose } = require('mongoose')
const bcrypt=require('bcrypt')


const home=(req,res)=>{
    res.render('landing')
}
const login=(req,res)=>{
    res.render('login')
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
    res.render('home')
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

module.exports={home,login,loginpost,signupget,signuppost}

