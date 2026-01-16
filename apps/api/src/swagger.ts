export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Link Marketplace API",
    version: "0.1.0",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register user",
        responses: { "201": { description: "Created" } },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login user",
        responses: { "200": { description: "OK" } },
      },
    },
    "/artisans": {
      get: {
        summary: "List artisans",
        responses: { "200": { description: "OK" } },
      },
    },
  },
};
