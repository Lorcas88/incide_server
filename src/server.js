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
  console.log(`Server running on port ${port}`);
});
