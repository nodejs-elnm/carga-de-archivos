const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productoSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    price: {
        type: Number,
        required: [true, 'El precio es necesario']
    },
    description: {
        type: String,
    },
    status: {
        type: Boolean, 
        required: true, 
        default: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories', 
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});


module.exports = mongoose.model('producto', productoSchema);