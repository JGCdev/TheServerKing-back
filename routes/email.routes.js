// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const async = require('async');

// Get Users
router.route('/reset/').get((req, res) => {
    User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            return res.send(500, 'Token de recuperación expirado o inválido');
        }
        return res.send(200, 'ok');
    });
})

router.post('/reset/', function (req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            return res.status(500).send('Token de recuperación expirado o inválido');
          }

          bcrypt.hash(req.body.password, 10).then((hash) => {
            user.password = hash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
    
            user.save(function(err) {
                done(err, user);
            });
          })
          
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
            host: process.env.MAILHOST,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAILUSER, // your domain email address
                pass: process.env.MAILPASS // your password
            }
        });
        var mailOptions = {
            from: process.env.MAILUSER,
            to: user.email,
            subject: 'Se ha cambiado tu contraseña',
            text: 'Hola,\n\n' +
                'Esta es una confirmación de que la contraseña de su cuenta ' + user.email + ' ha sido modificada.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
            res.status(200).jsonp(err);
            done(err);
        });
      }
    ], function(err) {
      return res.status(500).jsonp(err);
    });
  });

router.post( '/recover', function (req, res) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    return res.status(200).send('No hay usuario con ese email');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: process.env.MAILHOST,
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.MAILUSER, // your domain email address
                    pass: process.env.MAILPASS // your password
                }
            });

            var mailOptions = {
                from: process.env.MAILUSER,
                to: user.email,
                subject: 'The Server King Password Reset',
                text: 'Está recibiendo esto porque usted (u otra persona) ha solicitado el restablecimiento de la contraseña de su cuenta.\n\n' +
                'Haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso.:\n\n' +
                process.env.URIFRONT + '/auth/reset/' + token + '\n\n' +
                'Si no solicitó esto, ignore este correo electrónico y su contraseña permanecerá sin cambios.\n'
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                res.status(200).jsonp(req.body);
                done(err, 'done');
            });
        }
      ], function(err) {
        if (err) return next(err);
      });
});

module.exports = router;