// routes/auth.routes.js
const express = require("express");
const router = express.Router();
var nodemailer = require('nodemailer');

// email sender function
router.post('/send', function(req, res){
    // Convertir y ocultar con envirnoment VARIABLES
    // Definimos el transporter
    var transporter = nodemailer.createTransport({
        host: process.env.MAILHOST,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.MAILUSER, // your domain email address
            pass: process.env.MAILPASS // your password
        }
    });
    // Definimos el email
    var mailOptions = {
        from: 'Remitente',
        to: 'jegico93@gmail.com',
        subject: 'Asunto',
        text: 'Contenido del email'
    };
    // Enviamos el email
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
            res.send(500, err.message);
        } else {
            console.log("Email sent");
            res.status(200).jsonp(req.body);
        }
    });
});

module.exports = router;