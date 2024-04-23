const path = require('path');

const express = require('express');

const shop = express.Router();

const rootDir =  require('../util/path');

const bodyparse = require('body-parser');

const adminData = require('./admin');

const shopController = require('../controllers/shop')

const isauth = require('../middleware/is-auth')



shop.use(bodyparse.urlencoded({extended: false}));

shop.get('/',shopController.getIndex);

// shop.post('/',(req,res)=>{
//     res.redirect('/');
// });

shop.get('/products',shopController.getProducts );

shop.get('/product-list-details/:productID',shopController.getProductID );

shop.get('/cart',isauth,shopController.getCart)

shop.post('/cart-delete-item',isauth,shopController.postCartDeleteProducts);

shop.get('/checkout',isauth,shopController.checkout)

shop.post('/cart',isauth, shopController.postCart)

shop.get('/orders',isauth,shopController.getOrders)

shop.post('/orders',isauth,shopController.postOrder)


shop.get('/orders/:orderId',isauth,shopController.getInvoice);


exports.routes = shop;