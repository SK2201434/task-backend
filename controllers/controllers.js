const asyncHandler = require('express-async-handler');
const User = require('../model/usermodel');
const Product = require('../model/productmodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const upload = require('../middlewares/multer');
const tokenblacklist = require('../tokenBlacklist');
const path = require('path');

// Welcome route
const Welcome = (req, res) => {
    res.send('Welcome! Please log in to your account or register.');
};

// Create user
const registerUser = asyncHandler(async (req, res) => {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
        res.status(400).json({ message: 'All fields are mandatory' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        name,
        phone,
        email,
        password: hashedPassword,
        
    };

    const createdUser = await User.create(user);

    if (createdUser) {
        res.status(201).json({ message: 'User successfully created' });
    } else {
        res.status(500).json({ message: 'Failed to create user' });
    }
});

// Login
const loggin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'All fields are mandatory' });
        return;
    }

    const foundUser = await User.findOne({ email });

    if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
        const accessToken = jwt.sign(
            {
                user: {
                    id: foundUser._id,
                    email: foundUser.email,
                    name: foundUser.name, 
                    phone: foundUser.phone, 
                },
            },
            process.env.SECRETKEY
        );

        res.status(200).json({ accessToken, name: foundUser.name, phone: foundUser.phone, email: foundUser.email,id: foundUser._id });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// Assuming the user ID is in the request object after token validation for all the validation routes
// Logout
const tokenBlacklist = new Set();
const logout = asyncHandler(async (req, res) => {
    const authHeader = req.header('authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY, { ignoreExpiration: true });

        tokenblacklist.add(token);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});


// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId; 
        const { name, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { name, phone }, { new: true });

        if (updatedUser) {
            res.status(200).json({ message: 'Profile successfully updated', user: updatedUser });
        } else {
            res.status(500).json({ message: 'Failed to update profile' });
        }
    } catch (error) {
        console.error('Error in updateProfile route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Create product
const createProduct = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    let imageUrl = null;
    if (req.file) {
        imageUrl = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    }

    const product = {
        name,
        description,
        imageUrl, 
    };

    const createdProduct = await Product.create(product);

    if (createdProduct) {
        res.status(201).json({ message: 'Product successfully created', product: createdProduct });
    } else {
        res.status(500).json({ message: 'Failed to create product' });
    }
});

// get all the products
const getProducts = asyncHandler(async (req, res) => {
    
    const products = await Product.find({});

    if (products) {
        res.status(200).json({ products });
    } else {
        res.status(404).json({ message: 'No products found' });
    }
});




// Search products
const searchProducts = asyncHandler(async (req, res) => {
  
    const query = req.query.q;
    console.log(query)

    const products = await Product.find({ name: { $regex: new RegExp(query, 'i') } });

    res.status(200).json({ products });
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id; 
    const { name, description, variants } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { name, description, variants },
        { new: true }
    );

    if (updatedProduct) {
        res.status(200).json({ message: 'Product successfully updated', product: updatedProduct });
    } else {
        res.status(500).json({ message: 'Failed to update product' });
    }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (deletedProduct) {
        res.status(200).json({ message: 'Product successfully deleted' });
    } else {
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

module.exports = { Welcome, registerUser, loggin,logout, updateProfile, createProduct, searchProducts, updateProduct, deleteProduct,getProducts };
