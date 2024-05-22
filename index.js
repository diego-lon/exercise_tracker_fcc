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
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month, day] = dateString.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = `${dateObj.toDateString().slice(0, 3)} ${
    months[dateObj.getMonth()]
  } ${dateObj.getDate()} ${dateObj.getFullYear()}`;
  return formattedDate;
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
  const exist = users.some((us) => us.username === username);
  if (exist) {
    res.status(401).json({ error: "User already exists" });
  } else {
    users.push({ username, _id });
    res.json({ username, _id });
  }
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  const user = users.find((us) => us._id === _id);
  if (user) {
    const exercise = {
      username: user.username,
      description,
      duration,
      date: date ? formatDate(date) : timestampToDate(Date.now()),
      _id,
    };
    exercises.push(exercise);
    res.json(exercise);
  } else {
    res.status(401).json({ error: "User does not exists" });
  }
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const user = users.find((us) => us._id === _id);
  const exercise = exercises.filter((ex) => ex._id === _id);
  if (user) {
    const log = {
      _id,
      username: user.username,
      count: exercise.length,
      log: exercise,
    };
    res.json(log);
  } else {
    res.status(401).json({ error: "User does not exists" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
