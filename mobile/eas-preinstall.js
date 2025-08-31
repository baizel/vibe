const { execSync } = require("child_process");

try {
  console.log("Running npm install with legacy-peer-deps...");
  execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
  console.log("Dependencies installed successfully!");
} catch (error) {
  console.error("Failed to install dependencies:", error);
  process.exit(1);
}
