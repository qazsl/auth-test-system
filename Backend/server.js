// server.js
const express = require("express");
const cors = require("cors");
const pool = require("./database");

const app = express();

app.use(express.json());
app.use(cors());

// Регистрация нового пользователя
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Проверяем, существует ли пользователь с таким именем
    const userExists = await pool.query("SELECT * FROM accounts WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).send("Username already exists");
    }

    // Добавляем нового пользователя с обычным паролем
    const insertSTMT = `INSERT INTO accounts (username, password) VALUES ($1, $2)`;
    await pool.query(insertSTMT, [username, password]);

    res.status(201).send("Registration successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
});

// Логин пользователя
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM accounts WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(404).send("Account does not exist");
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).send("Invalid password");
    }

    res.send("Login successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

app.listen(4000, () => console.log("Server is listening on port 4000"));
