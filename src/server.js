import app from "./app.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
