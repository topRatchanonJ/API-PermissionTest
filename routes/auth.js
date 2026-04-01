const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const { authenticate, JWT_SECRET } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "username, email, and password are required." });

    if (User.findByUsername(username))
      return res.status(409).json({ error: "Username already exists." });

    if (User.findByEmail(email))
      return res.status(409).json({ error: "Email already exists." });

    if (roleId && !Role.findById(roleId))
      return res.status(400).json({ error: "Invalid roleId." });

    const user = await User.create({ username, email, password, roleId });
    res.status(201).json({ message: "User registered successfully.", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "username and password are required." });

    const user = User.findByUsername(username);
    if (!user || !user.active)
      return res.status(401).json({ error: "Invalid credentials." });

    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials." });

    const role = Role.findById(user.roleId);
    const permissions = Permission.findByIds(role?.permissionIds || []);
    const difyPermissions = Permission.toDifyFormat(permissions);

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: role?.name, permissions: difyPermissions },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: { id: user.id, username: user.username, email: user.email, role, permissions },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticate, (req, res) => {
  db.revokedTokens.push(req.token);
  res.json({ message: "Logged out successfully." });
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const role = Role.findById(user.roleId);
  const permissions = Permission.findByIds(role?.permissionIds || []);

  res.json({
    userId: user.id,
    username: user.username,
    role,
    permissions,
    difyPermissions: Permission.toDifyFormat(permissions),
  });
});

// GET /api/auth/dify-token
router.get("/dify-token", authenticate, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const role = Role.findById(user.roleId);
  const permissions = Permission.findByIds(role?.permissionIds || []);
  const difyPermissions = Permission.toDifyFormat(permissions);

  const difyPayload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: role?.name,
    permissions: difyPermissions,
    metadata: { roleId: role?.id, roleDescription: role?.description },
  };

  const difyToken = jwt.sign(difyPayload, JWT_SECRET, { expiresIn: "1h" });
  res.json({ difyToken, payload: difyPayload, expiresIn: "1h" });
});

module.exports = router;