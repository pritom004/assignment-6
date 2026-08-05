import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import * as repo from "./repository.js"; 
import 'dotenv/config';


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

repo.initDB()


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
  },
  apis: ["./*.js"],
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

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List all tasks
 *     description: Returns the full list of in-memory task objects.
 *     responses:
 *       200:
 *         description: List of tasks retrieved
 *   post:
 *     summary: Create a new task
 *     description: Adds a new task with done set to false by default.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy milk
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad Request - Title is missing or empty
 */
app.get("/tasks", async (req, res) => {
    const tasks = await repo.getAllTasks()
    return res.json(tasks)
});

app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Bad Request",
    });
  }

 const newTask = await repo.createTask(title);
  res.status(201).json(newTask);
});

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the task
 *     responses:
 *       200:
 *         description: Task details retrieved
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated title
 *               done:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad Request - Payload missing both title and done
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the task
 *     responses:
 *       204:
 *         description: Task deleted successfully (No Content)
 *       404:
 *         description: Task not found
 */
app.get("/tasks/:id", async (req, res) => {
const taskId = req.params.id;
const task = await repo.getTaskById(taskId);
  

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  const data = req.body;

  if (data.title === undefined && data.done === undefined) {
    return res.status(400).json({ error: "Bad Request" });
  }

  const existingTask = await repo.getTaskById(taskId);

  if (!existingTask) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  const newTitle = data.title !== undefined ? data.title : existingTask.title;
  const newDone = data.done !== undefined ? data.done : existingTask.done;

  const updatedTask = await repo.updateTask(taskId, newTitle, newDone);
  
  return res.json(updatedTask);
});

app.delete("/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  const deletedCount = await repo.deleteTask(taskId);

  if (deletedCount === 0) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  return res.status(204).end();
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI live at http://localhost:${PORT}/docs`);
});
