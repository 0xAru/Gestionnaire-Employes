const businessModel = require('../models/businessModel');
const businessRouter = require('express').Router();
const authGuard = require("../services/authGuard");
const bcrypt = require('bcrypt');


businessRouter.get('/', (req, res) => {
    try {
        let errors = null
        let adminId = req.session.adminId;
        if(req.session.errors) {
            errors = req.session.errors;
            delete req.session.errors;
        }
        res.render('pages/home.twig', {
            errors: errors,
            adminId: adminId
        })
    } catch (error) {
        error = { server_error: "Erreur lors de la connexion au serveur."};
        req.session.errors = error;
        return res.redirect('/login');
    }
})

businessRouter.get('/register', (req, res) => {
    try {
        let errors = null;
        if (req.session.errors) {
            errors = req.session.errors;
            delete req.session.errors;
        }
        res.render('pages/register.twig', {
            errors: errors
        })
    } catch (error) {
        res.send(error)
    }
});
// Route pour l'affichage de la page de connexion
businessRouter.get('/login', (req, res) => {
    try {
        let errors = null;
        if (req.session.errors) {
            errors = req.session.errors;
            delete req.session.errors;
        }
        res.render('pages/login.twig', {
            errors: errors
        });
    } catch (error) {
        res.send(error);
    }
});

// Route pour la connexion de l'administrateur de l'entreprise
businessRouter.post('/login', async (req, res) => {
    try {
        // Vérifier si l'administrateur existe
        let admin = await businessModel.findOne({ email: req.body.email });
        //Si il existe on redirige l'utilisateur vers son tableau de bord sinon on le redirige vers la page de connexion en lui indiquant l'erreur qui a eu lieu.
        if (admin) {
            let isPasswordValid = bcrypt.compareSync(req.body.password, admin.password)

            if (isPasswordValid) {
                req.session.adminId = admin._id;
                return res.redirect("/adminDashboard");
            } else {
                let error = { password: "Le mot de passe est incorrect." };
                req.session.errors = error;
                return res.redirect('/login');
            }
        } else {
            let error = { email: "L'email que vous utilisez est inconnu" };
            req.session.errors = error;
            return res.redirect('/login');
        }
    } catch (error) {
        error = { server_error: "Erreur lors de la connexion au serveur."};
        req.session.errors = error;
        return res.redirect('/login');
    }
});

businessRouter.get('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/")
    } catch (error) {
        res.send(error);
    }
})

//affichage du tableau de bord de l'entreprise (formulaire d'ajout et liste des employés)
businessRouter.get('/adminDashboard', authGuard, async (req, res) => {
    try {
        let errors = req.session.errors;
        let messages = req.session.messages;
        let adminId = req.session.adminId
        delete req.session.errors;
        delete req.session.messages;
        let company = null
        if (req.query.search) {
             company = await businessModel.findById(req.session.adminId).populate({
                path: "employees",
                match: {
                  $or: [
                    { firstname: new RegExp(req.query.search, "i")},
                    { name: new RegExp(req.query.search, "i") },
                  ]
                }
              });
        }else{
            company = await businessModel.findById(req.session.adminId).populate("employees",)
        }
        let employees = company.employees
        res.render("pages/adminDashboard.twig", {
            employees: employees,
            errors: errors,
            messages: messages,
            adminId: adminId
        });
    } catch (error) {
        req.session.errors = error.errors;
        res.redirect('/adminDashboard');
    }
});

businessRouter.post('/addBusiness', async (req, res) => {
    try {
            let newBusiness = new businessModel(req.body);
            let validationError = newBusiness.validateSync();
            if (validationError) {
                req.session.errors = validationError.errors
                return res.redirect('/register')
            } else {
                await newBusiness.save();
                res.redirect('/login');
            }
        } catch (error) {
        req.session.errors = error.errors
        res.redirect('/register');
    }
});

module.exports = businessRouter;