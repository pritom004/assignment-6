import { Pool } from "pg";
import 'dotenv/config';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    );
  `);

  const { rows } = await pool.query("SELECT COUNT(*) FROM tasks");
  if (parseInt(rows[0].count) === 0) {
    const seedTasks = [
      { title: "Review Q3 project proposal", done: false },
      { title: "Schedule quarterly team sync", done: true },
      { title: "Update server security certificates", done: false },
    ];

    for (const task of seedTasks) {
      await pool.query("INSERT INTO tasks (title, done) VALUES ($1, $2)", [
        task.title,
        task.done,
      ]);
    }
  }
}

export async function getAllTasks() {
  const { rows } = await pool.query("SELECT * FROM tasks");
  return rows;
}


export async function getTaskById(id) {
  const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  return rows[0];
}


export async function createTask(title) {
  
  const { rows } = await pool.query(
    "INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING *",
    [title]
  );
  return rows[0];
}


export async function updateTask(id, title, done) {
  const { rows } = await pool.query(
    "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
    [title, done, id]
  );
  return rows[0];
}


export async function deleteTask(id) {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  return result.rowCount;
}