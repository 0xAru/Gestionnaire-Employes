const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Entrez le nom de l'employé"]
    },
    firstname: {
        type: String,
        required: [true, "Entrez le prénom de l'employé"]
    },
    function: {
        type: String,
        required: [true, "Indiquez la fonction de cet employé"]
    },
    number_of_blame: {
        type: Number,
        default: 0
    },
    photo: {
        type: String,
    }
})

const employeeModel = mongoose.model("employees", employeeSchema);
module.exports = employeeModel;