const express = require('express');
const router = express.Router();
const app = express()
const { Welcome, registerUser, loggin,logout, updateProfile, createProduct, searchProducts, updateProduct, deleteProduct,getProducts } = require('../controllers/controllers');
// const valitadeToken = require('../middlewares/jwttokenhandeler');
const upload = require('../middlewares/multer');
const cors = require('cors');

app.use(cors(
    {origin:"https://65b711c2b7d1d8d3d6756e7e--vermillion-otter-0c423c.netlify.app",
    methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
    credential: true,}
));
// Welcome route
router.route("/").get(Welcome);

// User routes
router.route("/creatusers").post(registerUser);
router.route("/loggin").post(loggin);
router.route("/updateprofile/:userId").put(/*valitadeToken,*/ updateProfile);
router.route("/logout").post(/*valitadeToken,*/ logout);

// Product routes
router.route('/createproduct').post(/*valitadeToken,*/ upload.single('productImage'), createProduct);
router.route("/getproducts").get(/*valitadeToken,*/ getProducts);
router.route("/searchproducts").get(/*valitadeToken,*/ searchProducts);
router.route("/updateproduct/:id").put(/*valitadeToken,*/ updateProduct);
router.route("/deleteproduct/:id").delete(/*valitadeToken,*/ deleteProduct);

module.exports = router;
