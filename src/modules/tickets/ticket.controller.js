import {
  createService,
  getAll,
  getById,
  updateService,
  deleteService,
} from "./ticket.service.js";

export const index = async (req, res, next) => {
  try {
    const users = await getAll();

    res.status(200).json({ data: users });
  } catch (err) {
    next(err);
  }
};

export const show = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getById(id);

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const store = async (req, res, next) => {
  try {
    const user = await createService(req.body, req.user.id);

    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await updateService(id, req.body);

    res.status(200).json({ data: user });
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
