import swaggerJsdoc from "swagger-jsdoc";
// import {} from "../modules/auth"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Incide Server API",
      version: "1.0.0",
      description: "API documentation for Incide Server application",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.js", "./src/modules/**/*.swagger.js"],
};

const specs = swaggerJsdoc(options);

export default specs;
