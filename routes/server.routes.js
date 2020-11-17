// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');

const countries = require('../data/filters/countries.json')

// Get Users
router.route('/list').get((req, res) => {
    console.log('entra', req.query);
    console.log(countries);
    console.log(countries[req.query.country]);
    res.status(200).send({res: 'ok'})
})

// Sign-up
router.post("/register-server",
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
            console.log('Registramos servidor');
        }
    });

module.exports = router;
