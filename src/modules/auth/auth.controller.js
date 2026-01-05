import {
  registerService,
  loginService,
  deleteService,
  getById,
} from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await registerService(req.body);

    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const token = await loginService(req.body);

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getById(req.user.id);

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteService(id);

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
