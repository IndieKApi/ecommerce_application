const express = require('express')
const path = require('path');

const { check, body } = require('express-validator');

const router = express.Router();

const rootDir =  require('../util/path');

const bodyparse = require('body-parser')

const adminController = require('../controllers/admin')

const isauth = require('../middleware/is-auth')


//path is /admin/add-product
router.get('/add-product', isauth, adminController.getAddProduct);

//get admin products
router.get('/products',isauth ,adminController.getProducts)
// 
// /admin/products
router.post('/products',[

    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('image')
        .trim(),
    body('price')
        .trim()
        .isFloat(),
        
    body('description')
        .isLength({min: 5})
        .trim()

],isauth, adminController.PostnewProduct);

router.get('/edit-product/:productId',isauth, adminController.getEditProduct);

router.post('/edit-product',[

    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('imageUrl')
        .trim(),
    body('price')
        .trim()
        .isFloat(),
        
    body('description')
        .isLength({min: 5})
        .trim()

],isauth , adminController.postEditProduct);


router.delete('/product/:productId',isauth, adminController.deleteProduct);



exports.routes = router;


