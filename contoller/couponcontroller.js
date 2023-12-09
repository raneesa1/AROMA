
const product = require("../model/product"); // Import the product model
const user = require("../model/users");
const order = require('../model/order')

const cart = require("../model/cart");
const { json } = require("express");

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const coupon = require('../model/coupon')

// const verifyCoupon = async (req, res) => {
//     const code = req.body.code.toString().trim("")
//     console.log(code, "coupon codeeeeeeeeeeeeeeeeeeeeee")
//     const enteredDate = new Date()

//     const checkCode = await coupon.findOne({ Coupon_code: code })


//     if (checkCode) {
//         if (!checkCode.IsActive) {
//             res.status(400).json({ success: false, message: "This coupon is not active." });
//         }

//         if ((checkCode.Start_date && enteredDate < couponcheck.Start_date) ||
//             (Expirey_date && enteredDate > checkCode.Expirey_date)) {

//             res.status(400).json({ success: false, message: "Coupon is not valid at this time" });
//             return;
//         }
//         else {
//             res.json({
//                 success: true,
//                 discountValue: couponcheck.Discount_value,
//                 min: couponcheck.Min_purchase_amount,
//                 max: couponcheck.Max_discount_value
//             });
//         }


//     } else {
//         res.status(400).json({ success: false, message: "Invalid coupon code" });
//     }


// }


const getcoupon = async (req, res) => {
    const coupons = await coupon.find({})
    res.render('admin/coupon', { coupons })
}

const addcoupon = (req, res) => {


    res.render('admin/addcoupon', { err: '' })
}


const postaddcoupon = async (req, res) => {
    try {
        // const { CouponName, Coupon_code, Min_amount, Max_amount, Start_date, Expirey_date, Max_count, DiscountAmount } = req.body;
        // // console.log(".........", name, couponCode, maxAmount, discountAmount, couponType, startDate, endDate);



        // const existingCoupon = await coupon.findOne({ Coupon_code: Coupon_code });
        // if (existingCoupon) {
        //     throw Error( 'Coupon with this code already exists.')
        // }
        // if (!CouponName || !Coupon_code || !Min_amount || !Max_amount || !Expirey_date || !Start_date || !Max_count || !DiscountAmount) {
        //     throw Error ('Please provide all required fields with valid values.')

        // }



        const coupons = new coupon({
            CouponName: req.body.CouponName,
            Coupon_code: req.body.Coupon_code,
            Min_amount: req.body.Min_amount,
            Max_amount: req.body.Max_amount,
            Start_date: req.body.Start_date,
            Expirey_date: req.body.Expirey_date,
            Max_count: new Date(),
            IsActive: true,
            DiscountAmount: req.body.DiscountAmount,

        });
        await coupons.save();

        res.redirect('/admin/coupon')


    } catch (error) {
        // res.render('admin/addcoupon', { err: error.message })
        console.log(error)
        // res.status(500).json({ success: false, message: 'Internal server error' });
        // res.render('admin/404')

    }






}

const deletecoupon = async (req, res) => {
    console.log('delete api calling');
    const couponId = req.params.id
    // console.log(couponId, "couponnnnn iddddddddddd")
    let coupons = await coupon.findByIdAndDelete(couponId)
    res.redirect('/admin/coupon')
}

const posteditcoupon = async (req, res) => {
    try {
        const couponId = req.params.id;
        // let coupons = await coupon.findOne({ _id: couponId });
        const updatedCouponData = req.body;
        // Find the coupon by ID and update it
        const updatedCoupon = await coupon.findByIdAndUpdate(
            couponId,
            { $set: updatedCouponData },
            { new: true } // Return the updated document
        );
        res.redirect('/admin/coupon')


    } catch (error) {
        console.error('Error updating coupon', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const useCoupon = async (req, res) => {
    try {
        // console.log("coupon added"); 
        const { couponCode } = req.body;
        console.log(couponCode);
        const userData = await user.findOne({ email: req.session.email })

        const cartData = await cart.findOne({ userId: userData._id })
        // console.log(".................", cartData);
        const purchaseAmount = req.session.totalPrice
        // console.log(purchaseAmount);
        const coupons = await coupon.findOne({ Coupon_code: couponCode });
        // console.log(",,,,,,", coupons)
        if (!coupons) {
            return res.json({ success: false, message: 'Coupon not found' });
        }

        if (!coupons.IsActive) {
            return res.json({ success: false, message: "Coupon is not active" });

        }

        // const isCouponUsed = userData.usedCoupons.some(usedCoupon => usedCoupon.Coupon_code === couponCode);
        // console.log(isCouponUsed);
        // if (isCouponUsed) {

        //     console.log('going to if condition of is coupon used')
        //     // return res.json({ success: false, message: 'Coupon already used' });
        // }

        if (purchaseAmount < coupons.Min_amount) {
            console.log('going to if case of purchase is lesser than the coupon min amount')
            return res.json({ success: false, message: 'Purchase amount does not meet the minimum requirement for the coupon' });
        }
        console.log("--------", purchaseAmount, coupons.Min_amount);
        if (purchaseAmount < coupons.DiscountAmount) {

            console.log('going to if conditon of purchase is lesser than the coupon dicsount amount')
            return res.json({ success: false, message: 'Purchase Amount must Greater Than Discount amount' });
        }

        const currentDate = new Date();
        const endDate = new Date(coupons.Expirey_date);
        if (currentDate > endDate) {
            console.log('going to if condition of coupon expired')
            return res.json({ success: false, message: 'Coupon has expired' });
        }
        console.log(currentDate, endDate, "current date and end date");

        const discountedAmount = Math.min(purchaseAmount, coupons.DiscountAmount);
        const totalAfterDiscount = Math.floor(purchaseAmount - discountedAmount);
        req.session.grandTotal = totalAfterDiscount
        // console.log(totalAfterDiscount, "***********", "totall after the discount");
        // userData.usedCoupons.push({
        //     Coupon_code: couponCode,
        //     discountedAmount: discountedAmount,
        //     usedDate: new Date(),
        // });
        // await userData.save();
        // console.log(userData, "//////////////////////////////////////////////////////");


    
        // const updateOrder = await order.findOne({})

        return res.json({
            success: true,
            message: 'Coupon applied successfully',
            coupon: discountedAmount,
            discountedAmount: discountedAmount,
            grandTotal: totalAfterDiscount
        });

        

    } catch (error) {
        console.error(error, "error happpened in coupon management")
    }
}






module.exports = { useCoupon, deletecoupon, deletecoupon, getcoupon, addcoupon, postaddcoupon, posteditcoupon }