

const wishlist = require('../model/wishlist')
const user = require('../model/users')
const cart = require('../model/cart')







const getwishlist = async (req, res) => {
    const users = await user.findOne({ email: req.session.email });
    const userId = users._id;
    const cartDetails = await cart.findOne({ userId :userId})
    const wishListData = await wishlist.find({ userId: userId }).populate("Product.Product_id")
    res.render('user/wishlist', { wishListData, user: users, cartDetails })
}




const addToWishlist = async (req, res) => {

    try {


        console.log('function called')


        const productId = req.body.id;
        const users = await user.findOne({ email: req.session.email });
        const userId = users._id;

        // console.log(productId, "received product id ")


        if (!users) {
            return res.status(404).json({ message: 'User not found' });
        }

        let wishlists = await wishlist.findOne({
            userId: userId,
        });


        // console.log(userId, "id od user=++++++=====================================")
        // console.log(wishlist, "wishlist of userrrrrrrr--------------------------------")
        if (!wishlists) {
            wishlists = new wishlist({
                userId: userId,
                Product: [],
            });
            // console.log('inside if condition of no wishlist')
        }

        if (!wishlists.Product) {
            wishlists.Product = [];
            // console.log('inside if condition of no products in wishlist')
        }

        const existingItem = wishlists.Product.find(item => item.Product_id.toString() === productId);


        // console.log(existingItem, "consoling the existing items in wishlist")

        if (existingItem) {
            console.log('item is already in cart')
            return res.status(200).json({ message: 'Item is already in wishlist.' });


        } else {
            wishlists.Product.push({ Product_id: productId });
            await wishlists.save();
            console.log('saving the product to wishlist collection ')
            return res.status(200).json({ message: 'Item added to the wishlist.' });
        }
    } catch (error) {
        console.error('Error adding item to the wishlist:', error);
        return next(error)
    }


};





const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const users = await user.findOne({ email: req.session.email });
        const userId = users._id;



        const wishlists = await wishlist.findOne({ userId: userId });

        if (!wishlists) {
            return res.status(404).json({ message: 'Wishlist not found.' });
        }

        const updatedProductList = wishlists.Product.filter(item => item.Product_id.toString() !== productId);

        wishlists.Product = updatedProductList;
        await wishlists.save();
        

        
        return res.status(200).json({ message: 'Product removed from wishlist successfully.' });
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};





module.exports = { addToWishlist, getwishlist, removeFromWishlist }