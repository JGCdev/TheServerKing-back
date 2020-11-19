// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');

const countries = require('../data/filters/countries.json')

const multer = require('multer');

// File upload settings  
const PATH = './uploads';

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    let filetype = '';
    if(file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if(file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if(file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, file.fieldname + '-' + Date.now() + '.' + filetype)
  }
});

let upload = multer({
  storage: storage
});

// POST Servers
router.post('/list', upload.single('uploadedImage'), (req, res, next) => {
    const file = req.file
    console.log(JSON.parse(req.body.datas));
    console.log('Llega formulario, tratamos foto, creamos registro y devolvemos OK');
    
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.status(200).send({
        statusCode: 200,
        status: 'success',
        uploadedFile: file
    })

}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

// Get Servers
router.route('/list').get((req, res) => {
    console.log('entra', req.query);
    console.log(countries);
    console.log(countries[req.query.country]);
    res.status(200).send({res: 'ok'})
})


module.exports = router;
