import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const app = express();

app.use(express.json());

const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tickets`, ticketRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

export default app;
