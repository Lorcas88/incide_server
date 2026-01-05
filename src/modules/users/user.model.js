import pool from "../../config/db.js";

const table = "users";

const fillable = [
  "first_name",
  "last_name",
  "email",
  "password",
  "is_active",
  "role_id",
];
const hidden = ["password", "role_id"];

const fill = (data) => {
  const filtered = {};
  // Turn into an array, then iterates it to validate if a key of data
  // is included in the fillable array to finally save it in the filtered object
  Object.entries(data).forEach(([key, value]) => {
    if (fillable.includes(key)) {
      filtered[key] = value;
    }
  });

  return filtered;
};

const hideFields = (data, hidden) => {
  hidden.forEach((field) => {
    data.forEach((d) => {
      delete d[field];
    });
  });

  // Si la data a retornar es solo un objeto, cambiarlo de array a objeto
  if (data.length < 2) return data[0];

  return data;
};

export const all = async () => {
  const sql = `SELECT * FROM ${table}`;
  const [result] = await pool.query(sql);
  return hideFields(result, hidden);
};

export const find = async (id) => {
  const sql = `SELECT * FROM ${table} WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return hideFields(result, hidden);
};

export const create = async (data) => {
  const entries = fill(data);
  const fillableFields = Object.keys(entries);
  const columns = fillableFields.join(", ");
  const placeholders = fillableFields.map(() => "?").join(", ");

  const sql = `
    INSERT INTO ${table} (${columns}) 
    VALUES (${placeholders});
  `;
  const values = fillableFields.map((field) => data[field]);

  const result = await pool.execute(sql, values);
  return await find(result[0].insertId);
};

export const updateById = async (id, data) => {
  const entries = fill(data);
  if (Object.keys(entries).length === 0) {
    return null;
  }

  const fields = Object.entries(entries)
    .map(([key]) => `${key} = ?`)
    .join(",  ");

  // Turn the object into an array and then, creates a new one with
  // only the values
  const values = Object.entries(entries).map(([, value]) => value);

  const sql = `
    UPDATE ${table}
    SET ${fields}
    WHERE id = ?
  `;
  await pool.execute(sql, [...values, id]);

  return find(id);
};

export const deleteById = async (id) => {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  await pool.query(sql, [id]);
  return;
};

// Metodo necesario solo para el user
export const findByEmail = async (email) => {
  const sql = `
    SELECT *
    FROM ${table} 
    WHERE email = ?
  `;

  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};
