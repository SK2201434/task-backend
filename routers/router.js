const express = require('express');
const router = express.Router();
const { Welcome, registerUser, loggin,logout, updateProfile, createProduct, searchProducts, updateProduct, deleteProduct,getProducts } = require('../controllers/controllers');
const valitadeToken = require('../middlewares/jwttokenhandeler');
const upload = require('../middlewares/multer');

// Welcome route
router.route("/").get(Welcome);

// User routes
router.route("/creatusers").post(registerUser);
router.route("/loggin").post(loggin);
router.route("/updateprofile/:userId").put(valitadeToken, updateProfile);
router.route("/logout").post(valitadeToken, logout);

// Product routes
router.route('/createproduct').post(valitadeToken, upload.single('productImage'), createProduct);
router.route("/getproducts").get(valitadeToken, getProducts);
router.route("/searchproducts").get(valitadeToken, searchProducts);
router.route("/updateproduct/:id").put(valitadeToken, updateProduct);
router.route("/deleteproduct/:id").delete(valitadeToken, deleteProduct);

module.exports = router;
