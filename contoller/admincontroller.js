const product = require('../model/product');
const user = require('../model/users');
const {ObjectId}=require('mongodb')



const getusermanagement=(async (req,res)=>{
  // console.log("userss");
    const userdata= await user.find().sort({date:-1})
  // console.log(userdata)
    res.render('userm',{userdata})
})


//delete user
const getdeleteuser= async(req,res)=>{
    let id =req.params.id
    console.log("reached");
    let users=await user.findOneAndDelete({_id:id})
   res.redirect('/admin/user')

}
// / Block user
const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await user.updateOne({ _id: userId }, { $set: { status: true } });

    return res.redirect('/admin/user');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await user.updateOne({ _id: userId }, { $set: { status: false } });
    return res.redirect('/admin/user');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



const getproductmanagement = async(req, res) => {
  const productdata=await product.find().sort({date:-1})
  
    res.render('productm',{productdata});
};

const postaddproduct =async(req,res)=>{
  console.log(JSON.stringify(req.files))
    const products={
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        stock: req.body.stock,
        price: req.body.price,
        image: req.files.map((file) => '/photos/'+file.filename),
        date:Date.now()

    }
   await new product(products).save()
res.redirect('/admin/product')

}
//add
const getaddproduct=(req,res)=>{
    res.render('addproduct')

}
 


//delete product (only for building)
const getdeleteproduct= async(req,res)=>{
    let id =req.params.id
    // console.log("reached");
    let products=await product.findOneAndDelete({_id:id})
   res.redirect('/admin/product')

}


const getcategory=(req,res)=>{
  res.render('category')
}
module.exports = { getproductmanagement,getusermanagement,getcategory,getdeleteuser,unblockUser,blockUser,postaddproduct,getaddproduct,getdeleteproduct};
