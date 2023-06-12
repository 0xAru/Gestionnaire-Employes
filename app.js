// coeur de l'application, toutes les dépendances necessaires doivent etre présente ici de même pour la conexion à la base de données
const express = require("express");
const mongoose = require('mongoose');
const session = require("express-session");
const bcrypt = require('bcrypt');
const businessRouter = require('./routes/businessRouter');
const employeeRouter = require('./routes/employeeRouter');
require('dotenv').config();

const app = express();

 //l'ordre des middleware est très important !
app.use(express.static("assets"));
app.use(session({ secret: process.env.SECRET_SESSION, resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(function (req, res, next) {
//     //Connexion permanente pour les tests, à supprimer !!
//     req.session.adminId = "6482ede153a6ab4efddc0c07"
//     next()
// });
app.use(businessRouter);
app.use(employeeRouter);

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Connecté au port ${process.env.PORT}`);
      
    }
})

try {
    mongoose.connect(process.env.BDD_URI);
    console.log("Connecté à la base de données");
} catch (error) {
    console.log(error);
}