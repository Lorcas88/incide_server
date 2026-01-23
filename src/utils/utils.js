import crypto from "crypto";

export const hash = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const addMinutes = (minutes) => {
  const newDate = new Date();
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};

export const addDays = (days) => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const serialize = (data, fields) => {
  // If data is a single object (not an array)
  if (!Array.isArray(data)) {
    const copy = { ...data };
    fields.forEach((f) => delete copy[f]);
    return copy;
  }

  // If data is an array of objects
  return data.map((item) => {
    const copy = { ...item };
    fields.forEach((f) => delete copy[f]);
    return copy;
  });
};
