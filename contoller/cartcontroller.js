
const product = require("../model/product"); // Import the product model
const user = require("../model/users");
const cart = require("../model/cart");
const { json } = require("express");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;







const getcart = async (req, res) => {

    try {
        // let id = req.params.id;
        // let id = req.params.id;


        const email = req.session.email;
        // const username = req.session.email;
        const User = await user.findOne({ email: email })

        // console.log(req.params.id, "session")
        // console.log(serId, "user id")


        const userId = User._id;

        const newcart = await cart.findOne({ userId: userId }).populate("products.productId")

        if (!newcart || newcart.products.length === 0) {
            console.log("this .........inside of if");
            return res.render('cart', {
                title: "cart",
                username: email,
                product: [],
                subtotal: 0,
                total: 0,
                coupon: 0,
                gstAmount: 0,
                totalQuantity: 0,
                User,

            });
        }

        const products = newcart.products;
        let subtotal = 0;
        let totalQuantity = 0;


        newcart.products.forEach(item => {
        if (item.productId && item.productId.price !== undefined) {
            subtotal += item.quantity * item.productId.price;
            totalQuantity += item.quantity;
        } else {
            console.log("Skipping item due to missing or undefined DiscountAmount:", item.productId);
        }
    })
        const gstRate = 0.18;
        const gstAmount = subtotal * gstRate;
        const total = subtotal + gstAmount;


        req.session.totalPrice = total;
        res.render("cart", {
            title: "cart",
            username: email,
            product: products,
            newcart,
            subtotal: subtotal,
            gstAmount: gstAmount.toFixed(2),
            totalQuantity: totalQuantity,
            total: total,
            User,
        });



        //     console.log(users)
        //     if (users) {

        //         res.render('cart', { products: users.products });
        //     } else {
        //         res.redirect('/home')
        //         console.log('redirected to home in getcart function')
        //     }

    } catch (error) {
        console.log(error, "error from view cart")

    }


    // length: users.products.length
}












// const cart = require("../model/cart");
const addTocart = async function (req, res) {
    try {

        console.log('add to cart api called');
        const useremail = req.session.email
        const userId = await user.findOne({ email: useremail })
        console.log(userId)
        console.log(JSON.stringify(req.query))

        const productId = req.query.productId;
        // const productDetails = await product.findOne({ _id: productId });


        // const existingCart = await cart.findOne({ userId: userId._id, 'products.productId': productId });

        let cartData = await cart.findOne({ userId: userId });
        // console.log(cartData, 'cartdataaaaaaaa')
        if (cartData !== null) {
            const productIndex = cartData.products.findIndex(item => item.productId.toString() === productId.toString());
            if (productIndex !== -1) {
                cartData.products[productIndex].quantity += 1;
            } else {
                cartData.products.push({ productId: productId, quantity: 1 });
            }
            await cart(cartData).save();
            req.session.userCart = cartData._id;
            // console.log(req.session.userCart, "session of usercarrrrttttttttttrtrtrrtrtr")
        } else {
            console.log('going to else case')
            const cartData = await cart.create([{
                userId: userId,
                products: [{ productId: productId, quantity: 1 }],
            }]);
            await cart(cartData).save();
            req.session.userCart = cartData._id;

            // console.log(cartData, "cartdatttaaaaa")
            // console.log(req.session.userCart, "session of usercart")


        }


    } catch (error) {
        console.log("Error while adding to cart: ", error);
        res.render('user/404Page');
    }






    // await new cart(cartitems).save()
    // console.log(cartitems)
    // res.json({ status: true })




}

module.exports = { getcart, addTocart };
