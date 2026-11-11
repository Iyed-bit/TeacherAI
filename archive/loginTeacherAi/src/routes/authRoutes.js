const express = require("express");
const {
  login,
  showLogin,
  showSignup,
  signup,
} = require("../controllers/authController");

const router = express.Router();

router.get("/", showLogin);
router.get("/signup", showSignup);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
