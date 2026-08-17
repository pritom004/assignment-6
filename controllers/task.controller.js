import { pool } from "../config/repository.js";

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