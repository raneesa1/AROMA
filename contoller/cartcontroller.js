
const product = require("../model/product"); // Import the product model
const user = require("../model/users");

const cart = require("../model/cart");
const { json } = require("express");

const mongoose = require('mongoose');
const { productget } = require("./usercontroller");
const address = require("../model/address");
const order = require("../model/order");
const { ObjectId } = mongoose.Types;
const razorpay = require('razorpay');
const wallet = require("../model/wallet");
require("dotenv").config()
const { RAZORPAY_KEYID, RAZORPAY_KEY_SECRET } = process.env






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
                TotalPrice: 0,
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
                const { quantity, productId } = item;
                const { price, discountprice, discountexpiryDate } = productId;

                // Check if the product has an active offer
                if (discountexpiryDate && discountexpiryDate > new Date()) {
                    const discountedPrice = discountprice || 0;
                    subtotal += quantity * (price);
                } else {
                    subtotal += quantity * price;
                }

                totalQuantity += quantity;
            } else {
                console.log("Skipping item due to missing or undefined DiscountAmount:", item.productId);
            }
        });

        const totalDiscount = newcart.products.reduce((acc, item) => {
            const { quantity, productId } = item;
            const { discountprice, discountexpiryDate } = productId;

            if (discountexpiryDate && discountexpiryDate > new Date()) {
                const discountedPrice = discountprice || 0;
                acc += discountedPrice * quantity;
            }

            return acc;
        }, 0);

        const gstRate = 0.18;
        const gstAmount = Math.floor(subtotal * gstRate);
        const total = Math.floor(subtotal + gstAmount - totalDiscount);

        // console.log(total,"totaaaaall priceeee")

        req.session.totalPrice = total;
        res.render("user/cart", {
            title: "cart",
            username: email,
            product: products,
            newcart,
            // grandTotal: undefined,
            coupon: 0,
            subtotal: subtotal,
            gstAmount: gstAmount.toFixed(2),
            totalQuantity: totalQuantity,
            TotalPrice: total,
            User,
        });

    } catch (error) {
        console.log(error, "error from view cart")

    }
}

// adding product to cart
const addTocart = async function (req, res) {

    console.log('this function for verifying razor pay payment is working')
    console.log('Razorpay Key ID:', RAZORPAY_KEYID);
    console.log('Razorpay Key Secret:', RAZORPAY_KEY_SECRET);

    try {
        const useremail = req.session.email;
        const userId = await user.findOne({ email: useremail });

        const productId = req.query.productId;

        const productDetails = await product.findById(productId);
        if (!productDetails) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const stock = productDetails.stock;

        let cartData = await cart.findOne({ userId: userId });

        if (cartData !== null) {
            const productIndex = cartData.products.findIndex(item => item.productId.toString() === productId.toString());
            if (productIndex !== -1) {
                const currentQuantity = cartData.products[productIndex].quantity;
                if (currentQuantity < stock && currentQuantity < 10) {
                    cartData.products[productIndex].quantity += 1;
                    await cart(cartData).save();
                    req.session.userCart = cartData._id;
                    return res.json({ success: true, message: 'Product added to cart successfully' });
                } else {
                    if (currentQuantity >= 10) {
                        return res.json({ success: false, message: 'Cannot add more items. Maximum quantity reached (10).' });
                    } else {
                        return res.json({ success: false, message: 'Not enough stock to increase quantity' });
                    }
                }
            } else {
                if (stock > 0 && cartData.products.length < 10) {
                    cartData.products.push({ productId: productId, quantity: 1 });
                    await cart(cartData).save();
                    req.session.userCart = cartData._id;
                    return res.json({ success: true, message: 'Product added to cart successfully' });
                } else {
                    if (cartData.products.length >= 10) {
                        return res.json({ success: false, message: 'Cannot add more items. Maximum quantity reached (10).' });
                    } else {
                        return res.json({ success: false, message: 'Not enough stock to add product to cart' });
                    }
                }
            }
        } else {
            console.log('going to else case');
            if (stock > 0) {
                const cartData = await cart.create([{
                    userId: userId,
                    products: [{ productId: productId, quantity: 1 }],
                }]);
                await cart(cartData).save();
                req.session.userCart = cartData._id;
                return res.json({ success: true, message: 'Product added to cart successfully' });
            } else {
                return res.status(400).json({ success: false, message: 'Not enough stock to add product to cart' });
            }
        }
    } catch (error) {
        console.log("Error while adding to cart: ", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


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


    console.log('this functuion started working')

    try {


        console.log('function started working')

        const userData = await user.findOne({ email: req.session.email });
        const userId = userData._id;
        const addressinfo = await address.findOne({ userId: userData });
        const paymentMethod = req.body.selectedPaymentMethod
        const orderNumber = generateRandomString(8);
        const selectedAddressId = req.body.selectedAddressId;
        const selectedAddress = addressinfo.Address.find((address) => address._id == selectedAddressId);


        if (!selectedAddress) {
            return res.status(400).json({ success: false, message: 'Selected address not found' });
        }

        const cartDetails = await cart.findOne({ userId: userId })
        console.log(cartDetails, 'cartdetailss++++++++++++++++')

        const productIds = cartDetails.products.map(item => item.productId);

        console.log(productIds, "productId----------------------")
        const itemsPromises = cartDetails.products.map(async (item) => {
            const productDetails = await product.findOne({ _id: item.productId });
            return {
                status: 'Ordered',
                Price: productDetails.price,
                productId: item.productId,
                quantity: item.quantity,
                coupon: 0,
                discountprice: productDetails.discountprice || 0,
                discountexpiryDate: productDetails.discountexpiryDate

            };
        });


        const item = await Promise.all(itemsPromises);

        let totalDiscount = 0;

        item.forEach(items => {
            const { quantity, discountprice, discountexpiryDate } = items;

            // Check if the product has an active offer
            if (discountexpiryDate && discountexpiryDate > new Date()) {
                totalDiscount += discountprice * quantity;
            }
        });


        let price = 0

        if (cartDetails.coupon) {
            price = Math.floor(req.session.totalPrice - cartDetails.coupon)

        } else {
            price = Math.floor(req.session.totalPrice)

        }

          const totalPrice = price - totalDiscount;

          req.session.totalPrice = totalPrice
          req.session.totalDiscount = totalDiscount;
          console.log(req.session.totalPrice,"session total price")
          console.log(totalPrice,"total price from place order function")






        if (paymentMethod === "wallet") {
            const userWallet = await wallet.findOne({ User_id: userId });

            if (!userWallet || userWallet.Account_balance < totalPrice) {
                return res.status(400).json({ success: false, message: 'Not enough balance' });
            }

            await wallet.updateOne(
                { User_id: userId },
                {
                    $inc: { Account_balance: -totalPrice },
                    $push: {
                        Transactions: {
                            Amount: totalPrice,
                            Date: new Date(),
                            Description: 'placed an order',
                            Transaction_type: 'debited'
                        }
                    }
                }
            );

        }

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

        const savedOrder = await newOrder.save();

        if (savedOrder) {
            const deletecart = await cart.findOneAndDelete({ userId: userId });

            for (const item of cartDetails.products) {
                const productId = item.productId;
                const purchasedQuantity = item.quantity;
                await product.findOneAndUpdate(
                    { _id: productId },
                    { $inc: { stock: -purchasedQuantity } }
                );
            }

        }


        res.redirect('/ordermessage')





        // req.session.grandTotal = undefined



    } catch (error) {
        console.log('error from place order ', error)

    }


}



const generateRazorpay = async (req, res) => {
    try {


        console.log('function for generating razor pay payment is being called')
        const userData = await user.findOne({ email: req.session.email });
        const userId = userData._id;

        const cartData = await cart.findOne({ userId }).populate('products.productId');
        if (!cartData) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const totalPrice = Math.floor(req.session.totalPrice);
        const totalDiscount = Math.floor(req.session.totalDiscount || 0);

        // Applying coupon discount
        const couponDiscount = cartData.coupon || 0;
        const totalPriceAfterCoupon = totalPrice - couponDiscount;

        // Applying product offer discount
        const productOfferDiscount = calculateProductOfferDiscount(cartData.products);
        const totalPriceAfterProductOffer = totalPriceAfterCoupon - productOfferDiscount;

        console.log(totalPrice,"total price from razorpay function")
        // const amount = req.session.subtotal;

        const razorpayInstance = new razorpay({
            key_id: 'rzp_test_sFW0lvsM9VcWEf',
            key_secret: 'j6SVHsqESWXwWV1L4moiZRv3',
        });

        console.log('================================================')
        const options = {
            amount: totalPriceAfterProductOffer * 100,
            currency: "INR",
            receipt: userId,
            payment_capture: 1,
        };

        console.log('creating an order , console just above creating the order function')

      
        const createOrder = () => {
            return new Promise((resolve, reject) => {
                razorpayInstance.orders.create(options, (error, order) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(order);
                    }
                });
            });
        };

        const order = await createOrder();
        console.log('order saved in razor pay payment methhodd function')

        res.json({ order });
    } catch (error) {
        console.log(error.message + " generateRazorpay");
        return res.status(500).json({ error: "Razorpay order creation error" });
    }
};

const calculateProductOfferDiscount = (products) => {
    let productOfferDiscount = 0;
    products.forEach((product) => {
        if (product.productId && product.productId.discountexpiryDate && product.productId.discountexpiryDate > new Date()) {
            // If there is an active product offer, subtract the discount
            productOfferDiscount += product.productId.discountprice * product.quantity;
        }
    });
    return productOfferDiscount;
};



const verifyRazorpayPayment = async (req, res) => {
    try {


        console.log('this function for verifying razor pay payment is working')
        console.log('Razorpay Key ID:', process.env.RAZORPAY_KEYID);
        console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET);

        const { orderId, paymentId } = req.body;
        const razorpayInstance = new razorpay({
            key_id: 'rzp_test_sFW0lvsM9VcWEf',
            key_secret: 'j6SVHsqESWXwWV1L4moiZRv3',
        });


        razorpayInstance.payments.fetch(paymentId)
            .then((payment) => {
                if (payment.status === 'captured') {
                    res.json({ status: true });

                } else {
                    res.status(400).json({ status: false, message: "Payment verification failed" });
                }
            })

            .catch((err) => {
                console.error("Razorpay payment verification error:", err);
                res.status(500).json({
                    status: false,
                    message: "An error occurred while verifying the payment: " + err,
                });
            });
    } catch (error) {
        console.log(error.message + " verifyRazorpayPayment");
        res.status(500).json({ status: false, message: "Error in verifying Razorpay payment" });
    }
};



// const walletPayment = async(req,res)=>{

//     const userdata =  await user.findOne({email: req.session.email})
//     console.log(userdata,"userdata from wallet payment function")

//     const walletOfUser = await wallet.findOne({ User_id : userdata._id})


//     console.log(walletOfUser,"information from wallet of user")





// }



const getordermessage = async (req, res) => {
    try {
        const users = await user.findOne({ email: req.session.email })

        res.render('user/ordermessage', { users })
    } catch (error) {
        console.log(error, "error in sending order message")

    }

}




module.exports = { generateRazorpay, verifyRazorpayPayment, placeOrder, getordermessage, getcart, addTocart, removeCart, updateQuantity };
