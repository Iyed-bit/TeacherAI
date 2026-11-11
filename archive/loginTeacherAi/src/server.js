const path = require("node:path");
const dotenv = require("dotenv");
const app = require("./app");
const { connectDatabase } = require("./config/database");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Archived TeacherAI login app listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start the archived login app:", error);
  process.exitCode = 1;
});
