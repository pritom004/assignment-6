import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import taskRoutes from "./routes/tasks.routes.js";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js"
import { initDB } from "./config/repository.js";
import "dotenv/config";
import { authenticatedUser } from "./middlewares/auth.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes)

initDB();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task API",
      version: "1.0.0",
      description: "A lightweight in-memory CRUD API for managing tasks",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
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
  },

  apis: ["./*.js", "./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Root information endpoint
 *     description: Returns API metadata and available endpoints.
 *     responses:
 *       200:
 *         description: API details retrieved successfully
 */
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: 1.0,
    endpoints: ["/tasks"],
  });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Checks if the API server is up and running.
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/public/info", (req, res) => {
  res.json({ message: "Welcome stranger! This info is public." });
});


/**
 * @openapi
 * /protected/profile:
 *   get:
 *     summary: Read private profile data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *       401:
 *         description: Access token required
 */
app.get("/protected/profile", async (req, res) => {
  const header = req.headers.authorization;
  let token;

  if (header && header.startsWith("Bearer")) {
    token = header.split(" ")[1];
  } else {
    res.status(401).json({ error: "Access token required" });
  }

  return res.send("Successfully retrieved profile");
});

app.get("/protected/dashboard", authenticatedUser, (req, res) => {
  return res.sendStatus(200);
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running and connected to Supabase");
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI live at http://localhost:${PORT}/docs`);
});
