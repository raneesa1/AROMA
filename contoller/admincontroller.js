const category = require('../model/category');
// const product = require('../model/product');
const user = require('../model/users');
const order = require('../model/order')
const { ObjectId } = require('mongodb');
const product = require('../model/product');
const returns = require('../model/return');
const wallet = require('../model/wallet');



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
  try {


    console.log(JSON.stringify(req.files))
    console.log(req.body)

    const newname = req.body.name

    const existing = await product.findOne({ name: newname })

    if (existing) {
      const categorydata = await category.find()
      res.render('admin/addproduct', { categorydata, err: "Product with this name already exist" })
    } else {




      const products = {
        name: req.body.name,
        description: req.body.description,
        category: new ObjectId(req.body.category),
        specification: req.body.specification,
        price: req.body.price,
        stock: req.body.stock,
        image: req.files.map((file) => '/photos/' + file.filename),
        date: Date.now()

      }
      console.log(products)
      await new product(products).save()
      res.redirect('/admin/product')
    }
  } catch (error) {
    console.log(error, "error from post add product")
  }

}
//add
const getaddproduct = async (req, res) => {
  const categorydata = await category.find()
  console.log(categorydata, 'ghjkghj')


  res.render('admin/addproduct', { categorydata, err: "" })

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
  res.render('admin/category', { categorydata, err: "" })
}

//add category
const getaddcategory = (req, res) => {
  res.render('admin/addcategory', { err: '' })

}
const postaddcategory = async (req, res) => {
  try {


    const { name, description } = req.body;


    const existingCategory = await category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingCategory) {
      const categorydata = await category.find({})
      // Category with the same name already exists
      res.render('admin/addcategory', { err: 'Category already exists', categorydata: categorydata })




    } else {


      const categories = {
        name: req.body.name,
        description: req.body.description,
        date: Date.now()

      }
      await new category(categories).save()
      res.redirect('/admin/category')
    }
  } catch (error) {
    console.log(error, "error from adding category")

  }

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
  // console.log(id, ' id')
  let products = await product.findOne({ _id: id });
  let categorydata = await category.find()
  // console.log(categorydata, ' data of');
  // console.log(products);
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
    // console.log(req.body, 'body of update')

    let id = req.params.id;


    // console.log(req.file);
    // Check if files are present in the request
    if (req.files && req.files.length > 0) {
      const productsdetails = {
        name: req.body.name,
        description: req.body.description,
        category: new ObjectId(req.body.category),
        stock: req.body.stock,
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
        stock: req.body.stock,
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
      err: '',
      title: "Edit category",
      categories: categories,

    });
  }
};

const postupdatecategory = async (req, res) => {
  try {
    let id = req.params.id;

    const { name, description } = req.body;

    const categorydetails = {
      name: req.body.name,
      description: req.body.description,
    };


    const categories = await category.find({})

    const existingCategory = await category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingCategory) {
      res.render('admin/editcategory', { err: 'Category already exists', categories: categories })
    } else {

      await category.findOneAndUpdate({ _id: id }, { $set: categorydetails });
      res.redirect('/admin/category');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const getorder = async (req, res) => {
  try {
    const orderData = await order.find({})
      .sort({ OrderDate: -1 })
      .populate('UserID', 'name'); // Populate the 'UserID' field with 'name' property

    const userData = orderData.map(order => ({
      userId: order.UserID._id,
      userName: order.UserID.name,
    }));



    res.render('admin/orderm', { orderData, userData });
  } catch (error) {
    console.error('Error fetching order data:', error);
    res.status(500).send('Internal Server Error');
  }
};

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



const getorderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log('mmmmmmmmm', orderId);
    const newStatus = req.body.status;
    //   console.log('>>>>>>>>>>>>>',newStatus);  
    const orders = await order.findByIdAndUpdate(orderId, { Status: newStatus });

    console.log('...............56566556656565', orders);
    if (order) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log("Updating status error", error);

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}





const deleteImagess = async (req, res) => {
  console.log('function started')
  try {

    const productId = req.params.productId;
    // console.log("product iddddddddd", productId);
    const imageIndex = req.params.index;
    // console.log("image indexx0x0x0x00xx00x0x0x0x0x00xx00x0x00x0x0x00x0x0x0x0x0x0x0x00x0xx0x0x0x0x0x0x0x0", imageIndex);


    const products = await product.findById(productId);
    // console.log("Product after findingggngngngngngngngn", products);
    if (!products) {
      res.status(404).send('Product not found');
      return;
    }
    // console.log("..............", products);
    products.image.splice(imageIndex, 1);

    await products.save();
    // console.log('after spliceeee0e0ee0e00e0eeeeeeeeeeeeeeeee')

    res.status(200).send('Image deleted successfully');

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).send('Failed to delete image');
  }
}


const getreturns = async (req, res) => {

  const returnorder = await returns.find({})
  res.render('admin/return', { returnorder })
}


const postreturnstatus = async (req, res) => {

  console.log('the function to update status of return started working')
  console.log(req.params.returnId, "params from upating status or returns")

  console.log(req.body, "req.body -------- ")
  const returnId = req.params.returnId;
  const newStatus = req.body.status;



  console.log(newStatus, "updated status")

  const returndetails = await returns.findById(returnId)
  const userId = returndetails.userId
  const refundamount = returndetails.price
  const orderNumber = returndetails.orderNumber
  const returnedproduct = returndetails.productname
  console.log(userId)

  try {
    // Update the return status in the database
    const updatedReturn = await returns.findByIdAndUpdate(
      returnId,
      { Status: newStatus },
      { new: true }
    );

    if (newStatus === 'Accepted') {
      let userWallet = await wallet.findOne({ User_id: userId });

      if (!userWallet) {
        // If the user doesn't have a wallet, create one
        userWallet = new wallet({
          User_id: userId,
          Account_balance: 0,
          Transactions: [],
        });
      }


      userWallet.Account_balance += refundamount;


      userWallet.Transactions.push({
        Amount: refundamount,
        Date: new Date(),
        Description: `Refund for return of ${returnedproduct}`,
        Transaction_type: 'Refund',
      });

      await userWallet.save();
      console.log('Refund amount added to the useres wallet');

    }


    console.log(updatedReturn, "return data afte updating")

    if (!updatedReturn) {
      return res.json({ success: false, message: 'Return not found' });
    }

    const orders = await order.findOne({ orderNumber: orderNumber });

    if (!orders) {
      return res.json({ success: false, message: 'Order not found' });
    }

    orders.Items.forEach(item => {
      // Find the item in the order corresponding to the return
      if (item.productId.toString() === returndetails.product.toString()) {
        item.status = newStatus;
      }
    });

    await orders.save();

    return res.json({ success: true, message: 'Return status updated successfully' });
  } catch (error) {
    console.error('Error updating return status:', error);
    return res.json({ success: false, message: 'Error updating return status' });
  }
}



module.exports = { postreturnstatus, getreturns, deleteImagess, getorderStatus, getmoredetails, postupdatecategory, getorder, geteditcategory, getlogout, getproductmanagement, getdash, getusermanagement, getcategory, getdeleteuser, unblockUser, getdeleteproduct, blockUser, postaddproduct, getaddproduct, getaddcategory, postaddcategory, getdelecategory, geteditproduct, postupdateproduct };
