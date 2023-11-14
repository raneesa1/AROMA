const admin = require("../model/users");




const verifyadmin = async (req, res, next) => {
    if (req.session.isAdmin) {

        next();
    } else {
        res.redirect("/login")
    }
}


const adminExist = async (req, res, next) => {
    if (req.session.isAdmin) {

        res.redirect("/admin/");
    } else {
        next();
    }
};

module.exports = { adminExist, verifyadmin }