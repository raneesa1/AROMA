
const product = require('../model/product')
const Address = require('../model/address')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const OTP = require('../model/otp')

const category = require('../model/category')
const address = require('../model/address')
const user = require('../model/users')
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
                date: Date.now(),
                profileImage: "/photos/default-profile.jpeg"

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

    try {
        const userId = req.session.email;

        // Assuming you fetch user data here
        const userdata = await user.findOne({ email: userId });

        // If user data is not found, throw an error
        if (!userdata) {
            throw new Error('User not found');
        }

        // Render the profile view with user data
        res.render('profile', { userdata, err: null });
    } catch (error) {
        console.error(error.message);
        // Render the profile view with an error message
        res.status(500).render('profile', { userdata: null, err: error.message });
    }
}


const getlogout = (req, res) => {
    req.session.isauth = false
    res.redirect('/')
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


        const isPasswordValid = await bcrypt.compare(currentPassword, users.password);
        if (!isPasswordValid) {
            return res.render('changepassword', { err: 'Current password is incorrect' });
        }


        if (newPassword !== confirmPassword) {
            return res.render('changepassword', { err: 'New password and confirm password do not match' });
        }


        if (newPassword.length <= 8) {
            return res.render('changepassword', { err: 'Password must be strong' });
        }
        const letterCount = newPassword.replace(/[^a-zA-Z]/g, '').length; // Counting letters in the password
        if (letterCount < 3) {
            return res.render('changepassword', { err: 'Password must contain at least 3 letters' });
        }






        const hashedPassword = await bcrypt.hash(newPassword, 10);


        const updatedUser = await user.updateOne({ email: userId }, { $set: { password: hashedPassword } });

        if (updatedUser) {
            res.redirect('/profile');
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

const getaddress = async (req, res) => {
    const Address = await address.find()
    res.render('address', { Address })
}



const getaddaddress = async (req, res) => {

    res.render('addaddress')
}



const postaddaddress = async (req, res) => {
    try {
        let email = req.session.email
        // Create a new address document
        const newAddress = new Address({
            Addressname: req.body.Addressname,
            Firstname: req.body.Firstname,
            Secondname: req.body.Secondname,
            Address: req.body.Address,
            PhoneNumber: req.body.PhoneNumber,
            State: req.body.State,
            Landmark: req.body.Landmark,
            City: req.body.City,
            Pincode: req.body.Pincode,
            Country: req.body.Country
        });

        const users = await user.findOne({ email: email })
        // Save the new address to the database
        await new Address(newAddress).save();
        address.push(newAddress)
        



        // Redirect to the address list page or any other page you want
        res.redirect('/address');
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const geteditaddress = async (req, res) => {
    try {
        let id = req.params.id;
        let address = await Address.findOne({ _id: id });

        if (!address) {
            res.redirect('/address'); // Redirect to address list if the address is not found
        } else {
            res.render('editaddress', { title: 'Edit Address', address });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}






// const getcart = async (req, res) => {

//     try{
//         let id = req.params.id;

//         // const useremail=await user.find({email:req.session.email})
//         const userid = await user.findOne({ _id: id })

//         console.log(userid)
//         const userId = await user.findOne({ id: req.session.id })
//         console.log(userId)

//         const users = await cart.findOne({ userId: userId }).populate("products.productId", {

//             name: 1,
//             image: 1,
//             Price: 1

//         });

//         // res.json(user);
//         if (users) {

//             res.render('/cart', { products: users.Items, length: users.Items.length });
//         } else {
//             res.redirect('/home')
//             console.log('redirected to home in getcart function')
//         }

//     }catch(error){
//         console.log(error)

//     }
   


// }









const postupdateaddress = async (req, res) => {

    try {
        let id = req.params.id;
        console.log(id)
        const updatedAddress = {
            Addressname: req.body.Addressname,
            Firstname: req.body.Firstname,
            Secondname: req.body.Secondname,
            Address: req.body.Address,
            PhoneNumber: req.body.PhoneNumber,
            State: req.body.State,
            Landmark: req.body.Landmark,
            City: req.body.City,
            Pincode: req.body.Pincode,
            Country: req.body.Country
        };

        // console.log('req.body:', req.body);
        // console.log('updatedAddress:', updatedAddress);

        await Address.updateOne({ _id: id }, { $set: updatedAddress });
        res.redirect('/address'); // Redirect to address list after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}





//delete address
const getdeleteaddress = async (req, res) => {
    let id = req.params.id

    let Address = await address.findOneAndDelete({ _id: id })
    res.redirect('/address')

}












const getorderdetials = (req, res) => {
    res.render('orderdetials')
}

const geteditprofile = async (req, res) => {

    const userId = req.session.email


    const userdata = await user.findOne({ email: userId });
    res.render('editprofile', { userdata })
}
// Example route for handling edit profile form submission
const posteditprofile = async (req, res) => {
    try {
        const userId = req.session.email;
        const { editName, editPhoneNumber } = req.body;


        if (req.file) {
            // Update the user's profile photo path in the database
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





module.exports = { getdeleteaddress, postupdateaddress, postaddaddress, geteditprofile, posteditprofile, postchangepassword, postresetpassword, getresetpassword, getorderdetials, login, loginpost, signupget, signuppost, productget, getlanding, gethome, getprofile, getlogout, getwishlist, getcheckout, getforgotpassword, postforgotpassword, getchangepassword, getaccountdetials, geteditdetails, getmyorder, getaddress, geteditaddress, getaddaddress }

