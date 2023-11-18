const category = require('../model/category');
const product = require('../model/product');
const user = require('../model/users');
const { ObjectId } = require('mongodb')



const getusermanagement = (async (req, res) => {

  const userdata = await user.find().sort({ date: -1 })
  // console.log(userdata)
  res.render('userm', { userdata })
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


  const productdata = await product.find({ status: false }).sort({ date: -1 });
  const getproductmanagement = async (req, res) => {
    try {
      const productdata = await product.aggregate([
        {
          $match: { status: false }
        },
        {
          $lookup: {
            from: 'category',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        {
          $unwind: {
            path: '$categoryDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            category: '$categoryDetails.name', // Assuming 'name' is the field in the 'category' collection you want to display
            stock: 1,
            price: 1,
            specification: 1,
            date: 1
          }
        }
      ]);


      res.render('productm', { productdata });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  res.render('productm', { productdata });
};

const postaddproduct = async (req, res) => {
  console.log(JSON.stringify(req.files))
  console.log(req.body)
  const products = {
    name: req.body.name,
    description: req.body.description,
    category: new ObjectId(req.body.category),
    stock: req.body.stock,
    specification: req.body.specification,
    price: req.body.price,
    size: req.body.size,
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


  res.render('addproduct', { categorydata })

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
  console.log(categorydata,' data of');
  console.log(products);
  if (products == null) {
    res.redirect('/admin/product');
  } else {
    res.render('editproduct', {
      title: "Edit product",
      products: products, categorydata
    });
  }
};

const postupdateproduct = async (req, res) => {
  try {
    
    let id = req.params.id;
    console.log(req.body)

    // Check if files are present in the request
    if (req.files && req.files.length > 0) {
      const productsdetails = {
        name: req.body.name,
        description: req.body.description,
        category: new ObjectId(req.body.category),
        stock: req.body.stock,
        size: req.body.size,
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
        stock: req.body.stock,
        price: req.body.price,
        size: req.body.size,
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
  let categories = await category.findOne({ _id: id });

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
const getorder=async(req,res)=>{
  res.render('orderm')
}


module.exports = { postupdatecategory, getorder, geteditcategory, getlogout, getproductmanagement, getdash, getusermanagement, getcategory, getdeleteuser, unblockUser, getdeleteproduct, blockUser, postaddproduct, getaddproduct, getaddcategory, postaddcategory, getdelecategory, geteditproduct, postupdateproduct };
