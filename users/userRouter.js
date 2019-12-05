const express = require("express");
const userDb = require("./userDb");
const postDb = require("../posts/postDb");

const router = express.Router();

// Add user
router.post("/", validateUser, async (req, res) => {
  const { name } = req.body;

  try {
    const newUser = await userDb.insert({ name });

    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "New users information could not be saved." });
  }
});

// Add post
router.post("/:id/posts", validateUserId, validatePost, async (req, res) => {
  const { text, user_id } = req.body;

  try {
    const newPost = await postDb.insert({ text, user_id });

    return res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({
      error: "There was an error while saving the post to the database"
    });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await userDb.get();
    res.status(200).json(users);
  } catch (error) {
    console.log("The users information could not be retrieved.", error);
    res
      .status(500)
      .json({ error: "The users information could not be retrieved." });
  }
});

// Get user by ID
router.get("/:id", validateUserId, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userDb.getById(id);

    res.status(200).json(user);
  } catch (error) {
    console.log("The users information could not be retrieved.", error);
    res
      .status(500)
      .json({ error: "The user information could not be retrieved." });
  }
});

// Get all of users posts
router.get("/:id/posts", validateUserId, async (req, res) => {
  const { id } = req.params;

  try {
    const posts = await userDb.getUserPosts(id);
    if (!posts.length)
      throw new Error("The posts information could not be retrieved.");

    return res.status(200).json(posts);
  } catch (error) {
    console.log({ error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/:id", validateUserId, async (req, res) => {
  const { id } = req.params;

  try {
    const removed = await userDb.remove(id);
    if (!removed)
      return res
        .status(404)
        .json({ message: "The user with the specified ID does not exist." });

    res.status(200).json({ message: "User removed" });
  } catch (error) {
    console.log("The user could not be removed", error);
    res.status(500).json({ error: "The user could not be removed" });
  }
});

// Update user
router.put("/:id", validateUserId, async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.body)
      return res.status(500).json({ error: "The user could not be removed" });

    const updatedUser = await userDb.update(id, req.body);

    if (!updatedUser)
      return res
        .status(404)
        .json({ message: "The user with the specified ID does not exist." });

    const user = await userDb.getById(id);
    res.status(200).json(user);
  } catch (error) {
    console.log("The user information could not be modified.", error);
    res
      .status(500)
      .json({ error: "The user information could not be modified." });
  }
});

//custom middleware

async function validateUserId(req, res, next) {
  const { id } = req.params;
  const user = await userDb.getById(id);
  if (id) res.header("user", JSON.stringify(user));

  if (!user) return res.status(400).send({ message: "invalid user id" });

  next();
}

async function validateUser(req, res, next) {
  if (!req.body) return res.status(400).send({ message: "missing user data" });

  if (!req.body.name)
    return res.status(400).send({ message: "missing required name field" });

  next();
}

async function validatePost(req, res, next) {
  if (!req.body) return res.status(400).json({ message: "missing post data." });

  if (!req.body.text)
    return res.status(400).json({
      message: "missing required text field"
    });

  next();
}

module.exports = router;
