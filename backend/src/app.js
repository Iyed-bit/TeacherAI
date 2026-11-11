const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const corsOptions = require("./config/cors");
const apiRoutes = require("./routes/api");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: "128kb" }));
app.use(fileUpload({
  abortOnLimit: true,
  limits: { fileSize: 10 * 1024 * 1024 },
}));
app.use("/api", apiRoutes);
app.use(errorHandler);

module.exports = app;
