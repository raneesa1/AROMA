
const product = require("../model/product"); // Import the product model
const user = require("../model/users");
const cart = require("../model/cart");
const { json } = require("express");
const mongoose = require('mongoose');
const { productget } = require("./usercontroller");
const { ObjectId } = mongoose.Types;






///get method of cart page
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

    } catch (error) {
        console.log(error, "error from view cart")

    }
}




//adding product to cart
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



const removeCart = async (req, res) => {


    try {
        let email = req.session.email
        const userId = await user.findOne({ email: email })
        const userid = userId._id
        console.log(userid, "printing the user iddddd")






        const { productId } = req.body
        // console.log('removing product from cart-req.body:', productId)

        const usercart = await cart.findOne({ userId: userid })
        // const cartlength=usercart.length(
        // console.log(cartlength,"cartlength")

        // const productlength = usercart.products

        // console.log(productlength)
        // console.log('cart of user:', usercart)
        usercart.products = usercart.products.filter((item) => !item.productId.equals(productId))
        await cart(usercart).save()

        // console.log('cart of user after removing the data', usercart)


    } catch (error) {
        console.log(error, "error from removing item from cart")

    }
}


const updateQuantity = async (req, res) => {

    // console.log(req.session)
    // console.log(req.body)
    const { productId, quantity, cartId } = req.body
    // console.log(productId, cartId, quantity, "req.session of updatequantityy")

    try {
        const newcart = await cart.findOne({ _id: cartId }).populate("products.productId")
        if (!newcart) {
            console.log('cant not found')
            return res.status(404).json({ success: false, error: "Cart not found" });

        }
        const productInCart = newcart.products.find(item => item.productId.equals(productId))


        console.log(productInCart)
        if (!productInCart) {
            return res.status(404).json({ success: false, error: "Product not found in the cart" });
        }

        productInCart.quantity = quantity;
        // console.log(productInCart.quantity);

        await newcart.save();

        let subtotal = 0;
        let totalQuantity = 0;

        newcart.products.forEach(item => {
            const { quantity, productId } = item;
            const { price } = productId;
            subtotal += quantity * price;
            totalQuantity += quantity;

            console.log(price)
            console.log(subtotal, "totallllquantityvmfmeefef")
            console.log('wefnowlf woefnwoineowf fnownefownefoinfoiE')
            // console.log(req.body)

        })


        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            subtotal,
            totalQuantity,
        });

    } catch (error) {
        console.log(error, "error from updatequantity")
    }



}




module.exports = { getcart, addTocart, removeCart, updateQuantity };
