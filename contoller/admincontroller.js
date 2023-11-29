const category = require('../model/category');
const product = require('../model/product');
const user = require('../model/users');
const order = require('../model/order')
const { ObjectId } = require('mongodb')



const getusermanagement = (async (req, res) => {

  const userdata = await user.find().sort({ date: -1 })
  // console.log(userdata)
  res.render('admin/userm', { userdata })
})


//delete user
const getdeleteuser = async (req, res) => {
  let id = req.params.id

  let users = await user.findOneAndDelete({ _id: id })
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

const getproductmanagement = async (req, res) => {
  try {
    // Fetch product data with category details using aggregation
    const productdata = await product.aggregate([
      {
        $match: { status: false }
      },
      {
        $lookup: {
          from: 'categories', // categories collection is named 'categories'
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $sort: { date: -1 }
      }
    ]);

    res.render('admin/productm', { productdata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postaddproduct = async (req, res) => {
  console.log(JSON.stringify(req.files))
  console.log(req.body)
  let variants = []
  for (let i = 0; i < req.body.variantSize.length; i++) {
    variants.push({
      quantity: req.body.variantSize[i],
      stock: req.body.variantStock[i]
    })
  }
  console.log(variants)

  const products = {
    name: req.body.name,
    description: req.body.description,
    category: new ObjectId(req.body.category),
    specification: req.body.specification,
    price: req.body.price,
    size: variants,
    image: req.files.map((file) => '/photos/' + file.filename),
    date: Date.now()

  }
  console.log(products)
  await new product(products).save()
  res.redirect('/admin/product')

}
//add
const getaddproduct = async (req, res) => {
  const categorydata = await category.find()
  console.log(categorydata, 'ghjkghj')


  res.render('admin/addproduct', { categorydata })

}


//soft delete
const getdeleteproduct = async (req, res) => {
  let id = req.params.id
  // console.log("reached");
  await product.updateOne({ _id: id }, { $set: { status: true } });
  res.redirect('/admin/product')

}


const getcategory = async (req, res) => {
  const categorydata = await category.find().sort({ date: -1 })
  res.render('admin/category', { categorydata })
}

//add category
const getaddcategory = (req, res) => {
  res.render('admin/addcategory')

}
const postaddcategory = async (req, res) => {
  console.log(req.files)
  const categories = {
    name: req.body.name,
    description: req.body.description,
    stock: req.body.stock,
    // image: req.files.map((file) => '/photos/'+file.filename),
    date: Date.now()

  }
  await new category(categories).save()
  res.redirect('/admin/category')

}
//delete category (only for building)
const getdelecategory = async (req, res) => {
  let id = req.params.id
  // console.log("reached");
  let categories = await category.findOneAndDelete({ _id: id })
  res.redirect('/admin/category')

}


const geteditproduct = async (req, res) => {
  let id = req.params.id;
  console.log(id, ' id')
  let products = await product.findOne({ _id: id });
  let categorydata = await category.find()
  console.log(categorydata, ' data of');
  console.log(products);
  if (products == null) {
    res.redirect('/admin/product');
  } else {
    res.render('admin/editproduct', {
      title: "Edit product",
      products: products, categorydata
    });
  }
};

const postupdateproduct = async (req, res) => {

  try {
    console.log(req.body, 'body of update')

    let id = req.params.id;
    let variants = []
    for (let i = 0; i < req.body.variantSize.length; i++) {
      variants.push({
        quantity: req.body.variantSize[i],
        stock: req.body.existingVariantStock[i]

      })
    }

    // console.log(req.file);
    // Check if files are present in the request
    if (req.files && req.files.length > 0) {
      const productsdetails = {
        name: req.body.name,
        description: req.body.description,
        category: new ObjectId(req.body.category),
        size: variants,
        price: req.body.price,
        specification: req.body.specification,
        // Assuming images is an array of files
        image: req.files.map((file) => '/photos/' + file.filename)



      };

      // Update the product using findOneAndUpdate
      await product.findOneAndUpdate({ _id: id }, { $set: productsdetails });
    } else {
      // No files were uploaded, update only non-file fields

      const productsdetails = {
        name: req.body.name,
        description: req.body.description,
        category: new ObjectId(req.body.category),
        price: req.body.price,
        size: variants,
        specification: req.body.specification,


      };

      // Update the product using findOneAndUpdate
      await product.findOneAndUpdate({ _id: id }, { $set: productsdetails });
    }

    res.redirect('/admin/product');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const getdash = (req, res) => {
  if (req.session.isAdmin) {
    res.render('admin/dashboard')
  }

}
const getlogout = (req, res) => {
  req.session.isAdmin = false
  // req.session.destory()
  res.redirect('/')
}




const geteditcategory = async (req, res) => {
  let id = req.params.id;
  let categories = await category.findOne({ _id: id });

  if (category == null) {
    res.redirect('/admin/editcategory');
  } else {
    console.log('editing category')
    res.render('admin/editcategory', {
      title: "Edit category",
      categories: categories
    });
  }
};

const postupdatecategory = async (req, res) => {
  try {
    let id = req.params.id;

    // Check if files are present in the request
    if (req.files && req.files.length > 0) {
      const categorydetails = {
        name: req.body.name,
        description: req.body.description,
        stock: req.body.stock,
        // Assuming images is an array of files
      };
      // Update the product using findOneAndUpdate
      await category.findOneAndUpdate({ _id: id }, { $set: categorydetails });
    } else {


      // No files were uploaded, update only non-file fields
      const categorydetails = {
        name: req.body.name,
        description: req.body.description,
        stock: req.body.stock,
      };

      // Update the product using findOneAndUpdate
      await category.findOneAndUpdate({ _id: id }, { $set: categorydetails });
    }

    res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
const getorder = async (req, res) => {
  const orderData = await order.find({}).sort({ OrderDate :-1})
  console.log(orderData,' order data')
  res.render('admin/orderm', { orderData })
}

// const getmoredetails=async(req,res)=>{
//   try {
//     const orders = await order
//       .findOne({ _id: req.query.orderid })
//       .populate('Items.productId')

//     res.render('admin/orderdetails', { orderid: order._id });
//   } catch (error) {
//     console.error(error);

//     res.status(500).send('Internal Server Error');
//   }

// }
const getmoredetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(orderId);
    const orderData = await order.findOne({ _id: orderId }).populate('Items.productId');
    console.log(">>>>>>>>>>>>>", orderData);

    res.render('admin/moredetials', { orderData });

  } catch (error) {
    console.log(error)
  }
}



const getorderStatus=async(req,res)=>{
  try {
    const orderId = req.params.orderId;
      console.log('mmmmmmmmm',orderId);
    const newStatus = req.body.status;
    //   console.log('>>>>>>>>>>>>>',newStatus);  
    const order = await order.findByIdAndUpdate(orderId, { Status: newStatus });

    console.log('...............56566556656565',order);
    if (order) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log("Updating status error");
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

module.exports = { getorderStatus, getmoredetails, postupdatecategory, getorder, geteditcategory, getlogout, getproductmanagement, getdash, getusermanagement, getcategory, getdeleteuser, unblockUser, getdeleteproduct, blockUser, postaddproduct, getaddproduct, getaddcategory, postaddcategory, getdelecategory, geteditproduct, postupdateproduct };
