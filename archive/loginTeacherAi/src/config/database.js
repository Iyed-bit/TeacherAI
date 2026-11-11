const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.models.User || mongoose.model("User", loginSchema);

function connectDatabase() {
  const connectionString = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TeacherAiLogin";
  return mongoose.connect(connectionString);
}

module.exports = { connectDatabase, User };
