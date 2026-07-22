import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: 1.0,
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const tasks = [
  {
    id: 1,
    title: "Review Q3 project proposal",
    done: false,
  },
  {
    id: 2,
    title: "Schedule quarterly team sync",
    done: true,
  },
  {
    id: 3,
    title: "Update server security certificates",
    done: false,
  },
];

app.get("/tasks", (req, res) => {
  return res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const task = tasks.find((t) => t.id === parseInt(taskId));

  if (!task) {
    return res.status(404).json({
      error: `Task ${taskId} not found`,
    });
  }

  return res.json(task);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
