import crypto from "crypto";

export const hash = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const addDays = (days) => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};
