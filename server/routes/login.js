const express = require('express');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

// sign in with google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const User = require('../models/user');

const app = express();

// Acceso por email-pass

app.post('/login', (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB || !bcrypt.compareSync(body.mipass, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'Usuario o contraseña incorrectos'
                }
            });
        }


        let token = jwt.sign({
            user: userDB
        }, process.env.SEED, { expiresIn: process.env.EXPIRATION_TOKEN });


        res.json({
            ok: true,
            user: userDB,
            token
        });

    });


});

/////////////////////////
// Setting GOOGLE signIN

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUSer = await verify(token)
        .catch(err => {
            res.status(403).json({
                ok: false,
                err
            });
        });

    if (googleUSer) {

        User.findOne({ email: googleUSer.email }, (err, userDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (userDB) {

                if (userDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            msg: 'Debe utilizar su autenticación normal'
                        }
                    });
                } else {
                    let token = jwt.sign({
                        user: userDB
                    }, process.env.SEED, { expiresIn: process.env.EXPIRATION_TOKEN });

                    res.json({
                        ok: true,
                        user: userDB,
                        token
                    });
                }

            } else {
                // el usuario noexiste en DDBB >> creamos un nuevo usuario

                let user = new User();

                user.name = googleUSer.name;
                user.email = googleUSer.email;
                user.google = true;
                user.img = googleUSer.img;
                user.password = bcrypt.hashSync(':)', 10);

                user.save((err, userDB) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }

                    let token = jwt.sign({
                        user: userDB
                    }, process.env.SEED, { expiresIn: process.env.EXPIRATION_TOKEN });

                    res.json({
                        ok: true,
                        user: userDB,
                        token
                    });
                });

            }

        });
    }
});


module.exports = app;