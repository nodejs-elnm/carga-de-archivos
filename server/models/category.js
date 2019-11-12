const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;


let categorySchema = new Schema({

    name: {
        type: String,
        unique: true,
        required: [true, 'Campo \'name\' es necesario']
    },
    description: {
        type: String,
        default: 'Sin descripción'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'    // va el nombre del modelo que se ha exportado
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'users'
    }

});


categorySchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único'
});


// para la BBDD
module.exports = mongoose.model('categories', categorySchema);