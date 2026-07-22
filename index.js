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

app.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const taskIndex = tasks.findIndex((t) => t.id === parseInt(taskId));
  const data = req.body;

  if (taskIndex < 0) {
    return res.status(404).json({
      error: `Task ${taskId} not found`,
    });
  }

  if (data.task === undefined && data.done === undefined) {
    return res.status(400).json({
      error: "Bad Request",
    });
  }

  const updatedTask = Object.assign(tasks[taskIndex], data);

  tasks[taskIndex] = updatedTask

  return res.json(updatedTask);
});


app.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId))

  if(taskIndex < 0){
    return res.status(404).json({
      error: `Task ${taskId} not found`
    })
  }

  tasks.splice(taskIndex, 1)

  return res.status(204).end();
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

