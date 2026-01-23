import app from "./app.js";
import { config } from "./config/config.js";
import RefreshToken from "./modules/refresh-tokens/refreshToken.model.js";

const port = config.server.port;

// Cleanup expired refresh tokens every 24 hours
setInterval(
  async () => {
    const model = new RefreshToken();
    await model.deleteExpired();
  },
  24 * 60 * 60 * 1000,
);

app.listen(port, () => {
  const env = process.env.NODE_ENV || "development";
  console.log("");
  console.log(
    `  \x1b[42m\x1b[30m INFO \x1b[0m Server running on [\x1b[36mhttp://localhost:${port}\x1b[0m]`,
  );
  console.log("");
  console.log(
    `  \x1b[90mAPI Documentation: \x1b[36mhttp://localhost:${port}/api-docs\x1b[0m`,
  );
  console.log(`  \x1b[90mEnvironment: \x1b[33m${env}\x1b[0m`);
  console.log("");
  console.log("  \x1b[90mPress Ctrl+C to stop the server\x1b[0m");
  console.log("");
});
