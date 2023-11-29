
const product = require('../model/product')
const Address = require('../model/address')
const address = require('../model/address')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const OTP = require('../model/otp')

const category = require('../model/category')
const user = require('../model/users')
const { findOne } = require('../model/cart')
require("dotenv").config()







const getaddress = async (req, res) => {



    const users = await user.findOne({ email: req.session.email });
    const userId = users._id
    const addressofuser = await Address.findOne({ userId: users._id })
    // console.log(users._id)
    res.render('user/address', { addressofuser })
}



const getaddaddress = async (req, res) => {
    res.render('user/addaddress')
}



const postaddaddress = async (req, res) => {
    try {

        const users = await user.findOne({ email: req.session.email });
        console.log(users, "usersssss-----------")
        const existingAddress = await Address.findOne({ userId: users._id });


        const newAddress = {

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

        // console.log(req.body.Addressname, "---------------", users._id, "-------------------------", req.body.Firstname, "----------------------------", req.body.Secondname, "-------------------------", req.body.PhoneNumber, "---------------", req.body.State, "-------------------", req.body.Landmark, "---------------", req.body.City, "-----------------", req.body.Pincode, "-------------------------------------------", req.body.Country, "req.body.-------------------------------")
        // console.log(newAddress)


        if (existingAddress) {
            const savedAddress = await Address.findOneAndUpdate(
                { userId: users._id },
                { $push: { Address: newAddress } },
                { upsert: true, new: true }
            );
            // console.log(savedAddress, "savedaddressssssssssszzzzzzcvefvledfdpslfmv,d")

        } else {

            const savedAddress = await Address.create({
                userId: users._id,
                Address: [newAddress]
            });
            // console.log(savedAddress, "savedaddressssssssssszzzzzzcvefvledfdpslfmv,d")
        }



        // console.log(const savedAddress )

        res.redirect('/address');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const geteditaddress = async (req, res) => {
    try {
        const users = await user.findOne({ email: req.session.email });
        // const userId = users._id
        console.log(req.params.id, 'ihfwtgfretgbergrberb', "this is working instead of placeorder function")
        const addressofuser = await Address.findOne({ "Address._id": req.params.id }, { "Address.$": true })


        if (!addressofuser) {
            res.redirect('/address'); // Redirect to address list if the address is not found
        } else {
            console.log(addressofuser)
            res.render('user/editaddress', { title: 'Edit Address', addressofuser });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}




const postupdateaddress = async (req, res) => {

    try {
        const users = await user.findOne({ email: req.session.email });
        const userid = users._id
        const addressid = req.params.id
        // console.log(addressid)
        // console.log(userid, addressid,"userrrid and addresss iddddd")
        // const users = await user.findOne({ email: req.session.email });
        // const userId = users._id
        // const addressofuser = await Address.findOne({ userId: users._id })
        // console.log(id)
        const updatedAddress = {
            "Address.$.Addressname": req.body.Addressname,
            "Address.$.Firstname": req.body.Firstname,
            "Address.$.Secondname": req.body.Secondname,
            "Address.$.Address": req.body.Address,
            "Address.$.PhoneNumber": req.body.PhoneNumber,
            "Address.$.State": req.body.State,
            "Address.$.Landmark": req.body.Landmark,
            "Address.$.City": req.body.City,
            "Address.$.Pincode": req.body.Pincode,
            "Address.$.Country": req.body.Country
        };



        // console.log('req.body:', req.body);
        // console.log('updatedAddresssssssssssssssssssss:', updatedAddress);

        await Address.updateOne({ userId: userid, "Address._id": addressid }, { $set: updatedAddress });
        res.redirect('/address'); // Redirect to address list after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

//delete address
const getdeleteaddress = async (req, res) => {
    const users = await user.findOne({ email: req.session.email });
    const userid = users._id
    const addressid = req.params.id

    // console.log(addressid, "====================")
    // let id = req.params.id
    // console.log(addressId, "this i sthe eljnoef erfmjke frje foimerfoiemfoiemrfoiemfioermfoe")
    // console.log(addressId, "adressss")
    let Address = await address.updateOne({ userId: userid, "Address._id": addressid }, {
        $pull: {
            Address: { _id: addressid },
        },
    })

    console.log(Address)
    res.redirect('/address')

}

// const 



const postcheckoutaddaddress = async (req, res) => {
    try {

        const users = await user.findOne({ email: req.session.email });
        console.log(users, "usersssss-----------")
        const existingAddress = await Address.findOne({ userId: users._id });


        const newAddress = {

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

        // console.log(req.body.Addressname, "---------------", users._id, "-------------------------", req.body.Firstname, "----------------------------", req.body.Secondname, "-------------------------", req.body.PhoneNumber, "---------------", req.body.State, "-------------------", req.body.Landmark, "---------------", req.body.City, "-----------------", req.body.Pincode, "-------------------------------------------", req.body.Country, "req.body.-------------------------------")
        // console.log(newAddress)


        if (existingAddress) {
            const savedAddress = await Address.findOneAndUpdate(
                { userId: users._id },
                { $push: { Address: newAddress } },
                { upsert: true, new: true }
            );
            // console.log(savedAddress, "savedaddressssssssssszzzzzzcvefvledfdpslfmv,d")

        } else {

            const savedAddress = await Address.create({
                userId: users._id,
                Address: [newAddress]
            });
            // console.log(savedAddress, "savedaddressssssssssszzzzzzcvefvledfdpslfmv,d")
        }



        // console.log(const savedAddress )

        res.redirect('/selectaddress');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = { postcheckoutaddaddress, getdeleteaddress, postupdateaddress, postaddaddress, getaddress, geteditaddress, getaddaddress }