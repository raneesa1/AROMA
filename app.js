const express = require('express')
const app = express()
const adminrouter = require('./router/adminrouter')
const userrouter = require('./router/userrouter')
const productrouter = require('./router/productrouter')
const session = require('express-session')
const bcrypt = require('bcrypt')
const multer = require('multer')
const nodemailer = require('nodemailer');
const path = require('path');
const port = 3000



require('dotenv').config()
const api = process.env.API_URL
const nocache = require('nocache')
const product = require('./model/product')



app.use(nocache())
app.use(session({
    secret: 'raneesa',
    resave: false
}))
app.use(require('cors')())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'))
app.use('/', userrouter)
app.use('/admin', adminrouter)
app.use('/products', productrouter)
// const cartRoutes = require('./routes/cartRoutes');

const cartRoutes = require('./contoller/cartcontroller')




app.listen(port, (req, res) => {
    console.log(api)
    console.log('server running')
})






