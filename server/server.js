require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

/// path
const path = require('path');



const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// habilitar folder PUBLIC
app.use( express.static( path.resolve(__dirname,'../public')) );

// All routes
app.use( require( './routes/index'));

//Conexión a BaseDatos
mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false
}, (err) => {
    if (err) throw err;
    console.log('DDBB ONLINE');
}).catch (error => console.log(error));




app.listen(process.env.PORT);