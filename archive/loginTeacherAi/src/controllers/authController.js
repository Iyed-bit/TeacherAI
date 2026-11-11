const bcrypt = require("bcrypt");
const { User } = require("../config/database");

function showLogin(_req, res) {
  res.render("login");
}

function showSignup(_req, res) {
  res.render("signup");
}

async function signup(req, res, next) {
  const name = typeof req.body.username === "string" ? req.body.username.trim() : "";
  const password = req.body.password;
  if (!name || typeof password !== "string" || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(409).send("User already exists. Please choose a different username.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, password: hashedPassword });
    return res.redirect("/");
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const name = typeof req.body.username === "string" ? req.body.username.trim() : "";
  const password = req.body.password;
  if (!name || typeof password !== "string" || !password) {
    return res.status(401).send("Invalid username or password.");
  }

  try {
    const user = await User.findOne({ name });
    const isPasswordMatch = user && await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).send("Invalid username or password.");
    }
    return res.render("home");
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, showLogin, showSignup, signup };
