const user=require('../model/users')



const verifyuser=async(req,res,next)=>{
    if (req.session.isauth) {

        next();
    } else {
        res.redirect("/")
    }
}


const userExist = async (req, res, next) => {
    if (req.session.isauth) {

        res.redirect("/home");
    } else {
        next();
    }
};

module.exports={userExist,verifyuser}