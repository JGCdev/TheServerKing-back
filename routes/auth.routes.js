// routes/auth.routes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const userSchema = require("../models/User");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');
const {OAuth2Client} = require('google-auth-library');


// Download your OAuth2 configuration from the Google
const keys = require('../config/oauth2.keys.json');
const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
);



router.post("/signin-google", async (req, res, next) => {

    const tokenInfo = await oAuth2Client.getTokenInfo(
        req.body.authToken
    );

    if (tokenInfo.email) {
        userSchema.findOne({
            email: tokenInfo.email
        }).then(user => {
            if (!user) {
                const user = new userSchema({
                    username: req.body.name,
                    email: tokenInfo.email,
                    password: 'changeme-soci4l-l0gin'
                });
                user.save().then((response) => {
                    let jwtToken = jwt.sign(
                        {
                            email: tokenInfo.email,
                            userId: response._id
                        }, 
                        "longer-secret-is-better", 
                        {
                            expiresIn: "1h"
                        }
                    );
        
                    res.status(200).json({
                        token: jwtToken,
                        expiresIn: 3600,
                        _id: user._id
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
            } else {
                let jwtToken = jwt.sign(
                    {
                        email: tokenInfo.email,
                        userId: user._id
                    }, 
                    "longer-secret-is-better", 
                    {
                        expiresIn: "1h"
                    }
                );
                res.status(200).json({
                    token: jwtToken,
                    expiresIn: 3600,
                    _id: user._id
                });
            }
        })
    }
});

// Sign-up
router.post("/register-user",
    [
        check('username')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('password', 'Password should be between 5 to 15 characters long')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 15 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        } else {
            bcrypt.hash(req.body.password, 10).then((hash) => {
                const user = new userSchema({
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                });
                user.save().then((response) => {
                    res.status(201).json({
                        message: "User successfully created!",
                        result: response
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
            })
        }
    });


// Sign-in
router.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.username
    }).then(user => {
        console.log(user);
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            if (getUser.password === 'changeme-soci4l-l0gin') {
                return res.status(401).json({
                    message: "Authentication failed",
                    customError: 'reset'
                });
            } else {
                return res.status(401).json({
                    message: "Authentication failed"
                });
            }
        }
        if (getUser !== null && getUser !== undefined) {
            console.log('lotenemos');
            console.log(getUser.email)
            let jwtToken = jwt.sign(
                {
                    email: getUser.email,
                    userId: getUser._id
                }, 
                "longer-secret-is-better", 
                {
                    expiresIn: "1h"
                }
            );

            res.status(200).json({
                token: jwtToken,
                expiresIn: 3600,
                _id: getUser._id
            });
        }
    })
});


// Get Users
router.route('/').get((req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})

// Get Single User
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})

// Update User
router.route('/update-user/:id').put((req, res, next) => {
    userSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data)
            console.log('User successfully updated!')
        }
    })
})


// Delete User
router.route('/delete-user/:id').delete((req, res, next) => {
    userSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})

module.exports = router;
