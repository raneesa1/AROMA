
const product = require("../model/product"); // Import the product model
const user = require("../model/users");

const cart = require("../model/cart");
const { json } = require("express");

const mongoose = require('mongoose');
const { productget } = require("./usercontroller");
const address = require("../model/address");
const order = require("../model/order");
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
            return res.render('user/cart', {
                title: "cart",
                username: email,
                product: [],
                subtotal: 0,
                total: 0,
                coupon: 0,
                grandTotal: undefined,
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
                subtotal += Math.floor(item.quantity * item.productId.price);
                totalQuantity += item.quantity;
            } else {
                console.log("Skipping item due to missing or undefined DiscountAmount:", item.productId);
            }
        })
        const gstRate = 0.18;
        const gstAmount = Math.floor(subtotal * gstRate);
        const total = Math.floor(subtotal + gstAmount);

        // console.log(total,"totaaaaall priceeee")

        req.session.totalPrice = total;
        res.render("user/cart", {
            title: "cart",
            username: email,
            product: products,
            newcart,
            grandTotal: undefined,
            coupon: 0,
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


        // console.log('add to cart api called');
        const useremail = req.session.email
        const userId = await user.findOne({ email: useremail })
        // console.log(userId)
        // console.log(JSON.stringify(req.query) ,"querrrrrrrrryyyyyyyyyyyyyyyyyy from cart ")

        const productId = req.query.productId;
        const price = productId.price
        // console.log(price,"price of each productttttttt from cart funcitonnnnnnnnnnnnnnnn")
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

        console.log('cart of user after removing the data', usercart)


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



const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
};

const placeOrder = async (req, res) => {
    try {


        // console.log('post method is working')

        // console.log(req.session, "session offfffffffffffffffff place order")

        console.log('///////////////////////////////////////////////////////////////////////////////////////////')

        console.log(req.session.grandTotal, "granddtotal from session+++++++++++++")
        console.log(req.session.totalPrice, "total price from session____----------")

        console.log('///////////////////////////////////////////////////////////////////////////////////////////')

        const userData = await user.findOne({ email: req.session.email });
        const userId = userData._id;
        const addressinfo = await address.findOne({ userId: userData });

        const paymentMethod = req.body.selectedPaymentMethod



        const orderNumber = generateRandomString(8);

        // const coupons = await coupon.findOne({ Coupon_code: couponCode });

        // const purchaseAmount = req.session.totalPrice

        // const discountedAmount = Math.min(purchaseAmount, coupons.DiscountAmount);
        // const totalAfterDiscount = Math.floor(purchaseAmount - discountedAmount);
        // req.session.grandTotal = Math.floor(totalAfterDiscount)
        // // console


        // console.log(amount, "totaaaaallllll amounttnutnutntuntunttuntunt")
        const selectedAddressId = req.body.selectedAddressId;
        const selectedAddress = addressinfo.Address.find((address) => address._id == selectedAddressId);
        if (!selectedAddress) {
            return res.status(400).json({ success: false, message: 'Selected address not found' });
        }

        const cartDetails = await cart.findOne({ userId: userId })

        const productIds = cartDetails.products.map(item => item.productId);
        // console.log(productIds, "productt idddd")



        // Fetch product details, including price, for each product ID
        const itemsPromises = cartDetails.products.map(async (item) => {
            const productDetails = await product.findOne({ _id: item.productId });
            return {
                status: 'Ordered',
                Price: productDetails.price,
                productId: item.productId,
                quantity: item.quantity,
                grandTotal: undefined,
                coupon: 0,
                // discountedAmount: discountedAmount,
                // grandTotal: totalAfterDiscount
            };
        });

        // Wait for all promises to resolve
        const item = await Promise.all(itemsPromises);

        let amount = 0;

        if (req.session.grandTotal == undefined) {
            amount = req.session.totalPrice;
        } else {
            amount = req.session.grandTotal;
        }

        // console.log(item, "Items");  /

        // const productid = cartDetails.products.productId
        // console.log(productid, "this is the product id _________-----------------_______")

        const totalPrice = Math.floor(amount)


        const newOrder = new order({
            Status: 'Pending',
            Items: item,
            paymentMethod: paymentMethod,
            UserID: userId,
            orderNumber: orderNumber,
            TotalPrice: totalPrice,
            Address: {

                Addressname: selectedAddress.name,
                Firstname: selectedAddress.Firstname,
                Secondname: selectedAddress.Secondname,
                Address: selectedAddress.Address,
                PhoneNumber: selectedAddress.PhoneNumber,
                State: selectedAddress.State,
                Landmark: selectedAddress.Landmark,
                City: selectedAddress.City,
                Pincode: selectedAddress.Pincode,
                Country: selectedAddress.Country



            },
            OrderDate: new Date(),
        });
        // console.log("order saved", newOrder);
        const savedOrder = await newOrder.save();
        if (savedOrder) {
            const deletecart = await cart.findOneAndDelete({ userId: userId });
            // console.log(deletecart);




            for (const item of cartDetails.products) {
                const productId = item.productId;
                // console.log(productId,"00000000")

                const purchasedQuantity = item.quantity;
                // console.log(purchasedQuantity, "099090999999999")

                await product.findOneAndUpdate(
                    { _id: productId },
                    { $inc: { stock: -purchasedQuantity } }
                );
            }

        }
        // console.log('///////////////////////////////////////')

        req.session.grandTotal = undefined



        // console.log(grandTotal,'after making it undefined')

        console.log('/////////////////////////////////////// reached in making session grandtotal undefined')


        res.redirect('/ordermessage')
    } catch (error) {
        console.log('error from place order ', error)

    }


}





const getordermessage = async (req, res) => {
    try {
        const users = await user.findOne({ email: req.session.email })

        res.render('user/ordermessage', { users })
    } catch (error) {
        console.log(error, "error in sending order message")

    }

}




module.exports = { placeOrder, getordermessage, getcart, addTocart, removeCart, updateQuantity };
