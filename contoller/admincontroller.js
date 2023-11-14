const category = require('../model/category');
const product = require('../model/product');
const user = require('../model/users');
const { ObjectId } = require('mongodb')



const getusermanagement = (async (req, res) => {
  // console.log("userss");
  const userdata = await user.find().sort({ date: -1 })
  // console.log(userdata)
  res.render('userm', { userdata })
})


//delete user
const getdeleteuser = async (req, res) => {
  let id = req.params.id
  console.log("reached");
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
  const productdata = await product.find({ status: false }).sort({ date: -1 });

  res.render('productm', { productdata });
};

const postaddproduct = async (req, res) => {
  console.log(JSON.stringify(req.files))
  const products = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
    price: req.body.price,
    image: req.files.map((file) => '/photos/' + file.filename),
    date: Date.now()

  }
  await new product(products).save()
  res.redirect('/admin/product')

}
//add
const getaddproduct = (req, res) => {
  res.render('addproduct')

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
  res.render('category', { categorydata })
}

//add category
const getaddcategory = (req, res) => {
  res.render('addcategory')

}
const postaddcategory = async (req, res) => {
  console.log(req.files)
  const categories = {
    name: req.body.name,
    description: req.body.description,
    stock: req.body.stock,
    image: `/category/${req.files[0].filename}`,
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
  console.log(products);
  if (products == null) {
    res.redirect('/admin/product');
  } else {
    res.render('editproduct', {
      title: "Edit product",
      products: products,
    });
  }
};

const postupdateproduct = async (req, res) => {
  try {
    let id = req.params.id;

    // Check if files are present in the request
    if (req.files && req.files.length > 0) {
      const productsdetails = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        stock: req.body.stock,
        price: req.body.price,
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
        category: req.body.category,
        stock: req.body.stock,
        price: req.body.price,

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
    console.log("admin is there");
    res.render('dashboard')
  }

}
const getlogout = (req, res) => {
  req.session.isAdmin = false
  // req.session.destory()
  res.redirect('/')
}




const geteditcategory = async (req, res) => {
  let id = req.params.id;
  console.log(id, ' id')
  let categories = await category.findOne({ _id: id });
  // console.log(products);
  if (category == null) {
    res.redirect('/admin/editcategory');
  } else {
    console.log('editing category')
    res.render('editcategory', {
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
        image: req.files.map((file) => '/photos/' + file.filename)


      };

      // Update the product using findOneAndUpdate
      await category.findOneAndUpdate({ _id: id }, { $set: categorydetails });
    } else {

      console.log('first updating')
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


module.exports = { postupdatecategory, geteditcategory, getlogout, getproductmanagement, getdash, getusermanagement, getcategory, getdeleteuser, unblockUser, getdeleteproduct, blockUser, postaddproduct, getaddproduct, getaddcategory, postaddcategory, getdelecategory, geteditproduct, postupdateproduct };
