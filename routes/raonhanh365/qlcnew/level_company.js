const router = require('express').Router();
const LevelCompanyController = require("../../controllers/qlcnew/level_company")
const formData = require('express-form-data')

router.get("/", formData.parse(), LevelCompanyController.getAll);

router.get("/:id", formData.parse(), LevelCompanyController.getById);

router.post("/", formData.parse(), LevelCompanyController.create);

router.patch("/", formData.parse(), LevelCompanyController.edit);

router.delete("/:id", formData.parse(), LevelCompanyController.deletePermanently);

module.exports = router