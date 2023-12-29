const banner = require('../model/banner')
const flash = require('express-flash');

const getbanner = async (req, res) => {

    try {
        const bannerinfo = await banner.find({status:false})

        res.render('admin/bannerm', { bannerinfo })

    } catch (error) {
        console.log(error, "error from get banner function")
    }
}

const addbanner = async (req, res) => {
    try {
        console.log(req.body)
        const selectedPlacement = req.body.placement;
        const bannerInPlacement = await banner.findOne({ placement: selectedPlacement, status: false });


        if (bannerInPlacement) {
            const bannerinfo = await banner.find()
            // Display an error message if a banner already exists in the selected placement
           
            return res.render('admin/addbanner', { baner:bannerinfo ,err:'A banner already exists in the selected placement.'});
        }

        const ImagePath = '/photos/' + req.file.filename;
        const bannerinfo = {
            image: ImagePath,
            placement: req.body.placement
        }

        await new banner(bannerinfo).save()
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error, "error from adding new banner")
    }
}

const getaddbanner = async (req, res) => {
    try {
        const bannerinfo = await banner.find()
        res.render('admin/addbanner', { bannerinfo,err:""})
    } catch (error) {
        console.log(error, "error from add banner function")
    }
}

const editbanner = async (req, res) => {
    try {


        const bannerid = req.params.id
        const bannerinfo = await banner.findById(bannerid)
        

        console.log(bannerinfo, "info of selected banner")
        res.render('admin/editbanner', { banner: bannerinfo,err:"" })

    } catch (error) {

        console.log(error, "an error occured from edit banner function")
    }

}

const updatebanner = async (req, res) => {
    try {

        const bannerid = req.params.id
        console.log(req.body, "body of the updated banner")
        console.log(bannerid, "id of banner to update")

        const selectedPlacement = req.body.placement;
        const bannerInPlacement = await banner.findOne({ placement: selectedPlacement, status: false , _id: { $ne: bannerid } });
        if (bannerInPlacement) {
            const bannerinfo = await banner.findById(bannerid)
            return res.render('admin/editbanner', { banner:bannerinfo, err: 'A banner already exists in the selected placement.' });
        }

        if (req.file) {
            const ImagePath = '/photos/' + req.file.filename;

            const updatedbannerinfo = await banner.findByIdAndUpdate(bannerid,
                { $set: { image: ImagePath, placement: req.body.placement } },
                { new: true }
            )


        } else {

            const updatedbannerinfo = await banner.findByIdAndUpdate(bannerid,
                { $set: { placement: req.body.placement } },
                { new: true }
            )
        }


        res.redirect('/admin/banner')

    } catch (error) {
        console.log(error, "error from updating banner information")
    }
}


const deleteBannerImage = async (req, res) => {
    try {
        console.log('the backend function of deleting started working')
        const bannerId = req.params.id;
        const bannerInfo = await banner.findById(bannerId);
        console.log(bannerInfo, "info of banner from deletee function")

        if (!bannerInfo) {
            console.log('no banner info found')
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }
        const imagePath = bannerInfo.image;
        console.log(imagePath, "consoleing the path of existing banner")
        const updatedBanner = await banner.findByIdAndUpdate(
            bannerId,
            { $set: { image: null } },
            { new: true }
        );
        console.log('image path setted as null')

        res.json({ success: true, message: 'Banner image deleted successfully', banner: updatedBanner });
    } catch (error) {
        console.error('Error during banner image deletion:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const deletebanner = async(req,res)=>{
    try {
        const id = req.params.id
        await banner.updateOne({_id:id},{$set:{status:true}})
        res.redirect('/admin/banner')
        
    } catch (error) {
        console.log(error,"error from deleting function")
    }
}


module.exports = { deletebanner, deleteBannerImage, getbanner, addbanner, getaddbanner, editbanner, updatebanner }