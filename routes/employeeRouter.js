const businessModel = require('../models/businessModel');
const employeeModel = require('../models/employeeModel');
const authGuard = require("../services/authGuard");
const employeeRouter = require('express').Router();
const upload = require('../services/multer');

// Route permettant d'ajouter un nouvelle employé
employeeRouter.post('/addEmployee', authGuard, upload.single('photo'), async (req, res) => {
    try {
        if (req.file) {
            req.body.photo = req.file.filename;
        }
        let newEmployee = new employeeModel(req.body);
        let validationError = newEmployee.validateSync();
        if (validationError) {
            throw validationError;
        }
        await businessModel.updateOne({ _id: req.session.adminId }, { $push: { employees: newEmployee._id } });
        newEmployee.save();
        res.redirect("/adminDashboard");
    } catch (error) {
        console.log(error);
        req.session.errors = error.errors;
        res.redirect("/adminDashboard");
    }
});

employeeRouter.get('/updateEmployee/:id', authGuard, async (req, res) => {
    try {
        let employee = await employeeModel.findOne({ _id: req.params.id });
        res.render("pages/adminDashboard.twig", {
            employee: employee
        })
    } catch (error) {
        req.session.errors = error.errors;
        res.redirect("/adminDashboard");
    }
})

employeeRouter.post('/updateEmployee/:id', authGuard, upload.single("photo"), async (req, res) => {
    try {
        await employeeModel.updateOne({ _id: req.params.id }, req.body);
        req.session.messages = "Cet employé à bien été modifié";
    } catch (error) {
        req.session.errors = error.errors;
    }
    res.redirect("/adminDashboard");
})

employeeRouter.get('/blameEmployee/:id', authGuard, async (req, res) => {
    try {
        employee = await employeeModel.findOne({ _id: req.params.id });
        nbrBlame = employee.number_of_blame + 1;
        if (nbrBlame >= 3) {
            await employeeModel.deleteOne({ _id: req.params.id });
            await businessModel.updateOne({_id: req.session.adminId}, {$pull: {employees: req.params.id}})
            req.session.messages = "L'employé à été supprimé car il cumulait 3 blâmes";
        } else {
            await employeeModel.updateOne({ _id: req.params.id }, { number_of_blame: nbrBlame });
            req.session.messages = "Le blâme à bien été prit en compte";
        }
        res.redirect('/adminDashboard');
    } catch (error) {
        res.send(error)
    }
})

employeeRouter.get('/deleteEmployee/:id', authGuard, async (req, res) => {
    try {
        await employeeModel.deleteOne({ _id: req.params.id });
        await businessModel.updateOne({_id: req.session.adminId}, {$pull: {employees: req.params.id}})
        req.session.messages = "Cet employé à bien été supprimé";
    } catch (error) {
        req.session.errors = error.errors;
    }
    res.redirect("/adminDashboard");
})

module.exports = employeeRouter;