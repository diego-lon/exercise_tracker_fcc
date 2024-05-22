const express = require("express");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

require("dotenv").config();
const bodyParser = require("body-parser");
const users = [];
const exercises = [];

function timestampToDate(timestamp) {
  const dateObj = new Date(timestamp);
  const formattedDate = dateObj.toDateString();
  return formattedDate;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/,/g, "");
}

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const _id = uuidv4();
  users.push({ _id, username });
  res.json({ _id, username });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  const user = users.find((us) => us._id === _id);
  if (user) {
    const exercise = {
      _id,
      username: user.username,
      date: date ? formatDate(date) : timestampToDate(Date.now()),
      duration: Number(duration),
      description,
    };
    exercises.push(exercise);
    res.json(exercise);
  } else {
    res.status(401).json({ error: "User does not exists" });
  }
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find((us) => us._id === _id);
  let exercise = exercises.filter((ex) => ex._id === _id);

  if (from && to) {
    exercise = exercise.filter((ex) => {
      return (
        new Date(ex.date) >= new Date(from) && new Date(ex.date) <= new Date(to)
      );
    });
  }
  if (limit) {
    exercise = exercise.slice(0, Number(limit));
  }
  if (user) {
    const log = {
      _id,
      username: user.username,
      count: exercise.length,
      log: exercise,
    };
    if (from && to) {
      Object.assign(log, { from: formatDate(from) });
      Object.assign(log, { to: formatDate(to) });
    }
    res.json(log);
  } else {
    res.status(401).json({ error: "User does not exists" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
