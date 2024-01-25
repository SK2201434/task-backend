const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    variants: [
        {
            type: String,
        },
    ],
    imageUrl: {
        type: String, 
    },
});

const Product = mongoose.model('Product', productSchema);
mongoose.set('strictQuery', true);

module.exports = Product;
