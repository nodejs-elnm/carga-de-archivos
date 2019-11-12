const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Campo \'name\' es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Campo \'email\' es necesario']
    },
    password: {
        type: String,
        required: [true, 'Campo \'password\' es necesario']
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});


userSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};


userSchema.plugin( uniqueValidator, {
    message: '{PATH} debe ser único'
});


module.exports = mongoose.model( 'users', userSchema );