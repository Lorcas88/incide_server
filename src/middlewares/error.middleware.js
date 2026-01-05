export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.log(err);

  res.status(statusCode).json({
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Error interno del servidor",
  });
};

// if (err.code === "ER_DUP_ENTRY") {
//       return res.status(409).json({
//         error: {
//           code: "DUPLICATE_ENTRY",
//           message: "El email ya está registrado",
//         },
//       });
//     }
