const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const businessSchema = new mongoose.Schema({
    business_name: {
        type: String,
        required: [true, "Indiquez le nom de votre entreprise."]
    },
    siret_number: {
        type: String,
        required: [true, "Entrez le numéro SIRET de votre entreprise."],
        validate: {
            validator: function (value) {
                return /^\d{14}$|^\d{3}\s?\d{3}\s?\d{3}\s?\d{5}$/.test(value);
            },
            message: "Le siret doit contenir 14 chiffres au format 123 123 123 12345 ou 12312312312312"
        }
    },
    business_director: {
        type: String,
        required: [true, "Entrez le nom du directeur de l'entreprise."],
    },
    email: {
        type: String,
        required: [true, "Entrez l'email de votre entreprise."],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/.test(value);
            }
        }
    },
    password: {
        type: String,
        required: [true, "Entrez votre mot de passe."],
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!:;,\\\/?.')\'(']{8,}$/.test(value);
            },
            message: "Votre mot de passe n'est pas valide"
        }
    },
    confirm_password: {
        type: String,
        required: [true, "Confirmez le mot de passe."],
        validate: {
            validator: function (value) {
                return this.password == this.confirm_password;
            },
            message: "Les deux mots de passe ne sont pas identiques "
        }
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "employees"
    }]
});

businessSchema.pre('save', async function (next) {
    try {
        if (this.password == this.confirm_password) {
            this.password = bcrypt.hashSync(this.password, 10)
            this.confirm_password = this.password
            next();
        }
    } catch (error) {
        return (error);
    }
});

const businessModel = mongoose.model("businesses", businessSchema);
module.exports = businessModel;