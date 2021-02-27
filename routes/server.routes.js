// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');
const serversSchema = require("../models/Server");
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
    cb(null, Date.now() + '-' + file.originalname)
  }
});

let upload = multer({
  storage: storage
});

// POST Servers
router.post('/list', upload.single('uploadedImage'), (req, res, next) => {
    console.log('---- POST: Nuevo servidor ----');
    const file = req.file
    console.log(file);
    const serverData = JSON.parse(req.body.data)
    
    // if (!file) {
    //     const error = new Error('Please upload a file')
    //     error.httpStatusCode = 400
    //     return next(error)
    // }

    const server = new serversSchema({
      game: serverData.juego,
      servername:  serverData.servername,
      description:  serverData.description,
      creationDate:  new Date(),
      refreshDate:  new Date(),
      country:  serverData.country,
      type:  serverData.type,
      owner:  serverData.owner,
      ip:  serverData.ip,
      web: serverData.web,
      youtube: serverData.youtube,
      discord: serverData.discord,
      imgPath: file.filename,
      tags: serverData.tags,
    });

    console.log('Guardamos server: ')

    server.save().then((response) => {
        console.log(response);
        res.status(201).json({
            message: "Server successfully created!",
            result: response
        });
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });

}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

// Get Servers By User
router.route('/listByUser/:id').get((req, res) => {
  console.log('---- GET: LIST BY USER ID ----');
  console.log(req.params.id);
  serversSchema.find(
    {owner: req.params.id},
    (error, response) => {
    if (error) {
        return next(error)
    } else {
        res.status(200).json(response)
    }
  })
})

// Get Servers
router.route('/list').get((req, res) => {
    console.log('---- GET: LIST ----');
    console.log('params', req.query);
    console.log('Match con lista de paises: ', countries[req.query.country]);
    const params = fillParams(req.query);
    console.log('FP: ', params);
    serversSchema.find(
      params, 
      (error, response) => {
      if (error) {
          return next(error)
      } else {
          res.status(200).json(response)
      }
    })
})

// Get Server
router.route('/list/:id').get((req, res) => {
  console.log('---- GET: LIST BY ID ----');
  serversSchema.findById(
    req.params.id,
    (error, response) => {
    if (error) {
        return error;
    } else {
        console.log(response);
        res.status(200).json(response)
    }
  })
})

function fillParams(params) {
  let newParams = {
    game: params.game,
  }

  if (params.order === '0') {
    // Orden por conectados
  } else if(params.order === '1') {
    // Orden por fecha
  }

  // Rellenamos tags si existen y si es diferente a 'Todos'
  if (params.country && params.country !== '0') {
    newParams.country = params.country;
  }

  if (params.tags && params.tags !== '0' ) {
    // Generamos array con tags como pide mongoDB
    newParams.tags = {
      $all: params.tags.split(',')
    }
  }

  return newParams
}


module.exports = router;
