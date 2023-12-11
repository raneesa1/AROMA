const user = require('../model/users');
const wallet = require('../model/wallet');

const razorpay = require('razorpay');
const { placeOrder } = require('./cartcontroller');




const getwalletpage = async (req, res) => {
    const users = await user.findOne({ email: req.session.email });
    const userId = users._id;
    const walletinfo = await wallet.findOne({
        User_id: userId
    })
    res.render('user/wallet', { walletinfo })
}




//add money to wallet
const addMoneyToWallet = async (req, res) => {

    try {
        const users = await user.findOne({ email: req.session.email });
        if (users) {
            const existingWallet = await wallet.findOne({ User_id: users._id });
            if (existingWallet) {

                await wallet.updateOne(
                    { User_id: users._id },
                    {
                        $set: { Account_balance: existingWallet.Account_balance + req.body.amount },
                        $push: {
                            Transactions: {
                                Amount: req.body.amount,
                                Date: new Date(),
                                Description: 'Money added to wallet',
                                Transaction_type: 'credited'
                            }
                        }
                    }
                );
            } else {

                const newWallet = new wallet({
                    User_id: users._id,
                    Account_balance: req.body.amount,
                    Transactions: [{
                        Amount: req.body.amount,
                        Date: new Date(),
                        Description: 'Money added to wallet',
                        Transaction_type: 'credited'
                    }]
                });
                await newWallet.save();
            }
            res.send('Money added successfully');
        } else {
            res.redirect('/wallet');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};



//add money razor pay
const wallet_razorpay = async (req, res) => {
    try {
        const userData = await user.findOne({ email: req.session.email });
        const userId = userData._id;
        const options = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: userId,
            payment_capture: 1,
        };

        var instance = new razorpay({
            key_id: process.env.RAZORPAY_KEYID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error creating Razorpay order' });
            } else {

                res.json(order);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports = { addMoneyToWallet, wallet_razorpay, getwalletpage }