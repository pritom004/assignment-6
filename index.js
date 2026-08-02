import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import Database from "better-sqlite3";

const app = express();
const db = new Database("tasks.db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const query = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

db.exec(query);

const SEED_TASKS = [
  {
    title: "Review Q3 project proposal",
    done: 0,
  },
  {
    title: "Schedule quarterly team sync",
    done: 1,
  },
  {
    title: "Update server security certificates",
    done: 0,
  },
];

const seedData = () => {
  const insertTasks = db.prepare(
    "INSERT INTO tasks (title, done) VALUES(?, ?)",
  );

  SEED_TASKS.forEach((task) => {
    insertTasks.run(task.title, task.done);
  });
  // Do NOT close the database here, or the API won't be able to use it later.
};

const { hasRows } = db
  .prepare("SELECT EXISTS(SELECT 1 FROM tasks) AS hasRows")
  .get();

if (hasRows === 0) {
  seedData();
}

const formatTask = (task) => ({
  ...task,
  done: !!task.done,
});

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
app.get("/tasks", (req, res) => {
  const dbTasks = db.prepare("SELECT * FROM tasks").all();
  const formattedTasks = dbTasks.map(formatTask);

  return res.json(formattedTasks);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Bad Request",
    });
  }

  const task = { id: tasks.length + 1, title, done: false };

  tasks.push(task);
  res.status(201).json(task);
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
app.get("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  // Map SQLite 1/0 back to true/false
  task.done = task.done === 1;

  return res.json(task);
});

app.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const taskIndex = tasks.findIndex((t) => t.id === parseInt(taskId));
  const data = req.body;

  if (taskIndex < 0) {
    return res.status(404).json({
      error: `Task ${taskId} not found`,
    });
  }

  if (data.title === undefined && data.done === undefined) {
    return res.status(400).json({
      error: "Bad Request",
    });
  }

  const updatedTask = Object.assign(tasks[taskIndex], data);

  tasks[taskIndex] = updatedTask;

  return res.json(updatedTask);
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex((task) => task.id === parseInt(taskId));

  if (taskIndex < 0) {
    return res.status(404).json({
      error: `Task ${taskId} not found`,
    });
  }

  tasks.splice(taskIndex, 1);

  return res.status(204).end();
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI live at http://localhost:${PORT}/docs`);
});
