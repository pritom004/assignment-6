import { Pool } from "pg";

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

