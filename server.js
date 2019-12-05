const express = require("express");
const userRoutes = require("./users/userRouter");

const server = express();

server.use(logger);
server.use(express.json());

server.get("/", (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

server.use("/api/users", userRoutes);

//custom middleware

function logger(req, res, next) {
  console.log(
    `${req.method} to ${req.originalUrl} at timestamp: ${Date.now()}`
  );

  next();
}

module.exports = server;
