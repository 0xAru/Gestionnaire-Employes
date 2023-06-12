const businessModel = require("../models/businessModel")

const authGuard = async (req, res, next) => {
    try {
        if (req.session.adminId) {
            let company = await businessModel.findOne({ _id: req.session.adminId })
            if (company) {
                return next()
            } else {
                res.redirect('/login')
            }
        }
        res.redirect('/login')
    } catch (error) {
        res.redirect('/login')
    }
}

module.exports = authGuard