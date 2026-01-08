import app from "./app.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { config } from "./config/config.js";

app.use(errorHandler);

const port = config.server.port;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
