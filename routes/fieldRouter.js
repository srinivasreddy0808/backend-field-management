const express = require("express");
const fieldController = require("../controllers/fieldController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.protect, fieldController.createField)
  .get(authController.protect, fieldController.getAllFields);

router
  .route("/:fieldId")
  .patch(authController.protect, fieldController.updateField)
  .delete(authController.protect, fieldController.deleteField);

module.exports = router;
