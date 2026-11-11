const path = require("node:path");
const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "../views"));
app.use(express.static(path.resolve(__dirname, "../public")));
app.use(authRoutes);

module.exports = app;
