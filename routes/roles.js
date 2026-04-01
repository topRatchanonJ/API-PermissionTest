const express = require("express");
const router = express.Router();
const Role = require("../models/Role");
const { authenticate } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/permission");

// GET /api/roles
router.get("/", authenticate, (req, res) => {
  const roles = Role.findAll();
  res.json({ total: roles.length, roles });
});

// GET /api/roles/:id
router.get("/:id", authenticate, (req, res) => {
  const role = Role.findById(req.params.id);
  if (!role) return res.status(404).json({ error: "Role not found." });
  res.json(role);
});

// POST /api/roles
router.post("/", authenticate, requireAdmin, (req, res) => {
  const { name, description, permissionIds } = req.body;
  if (!name) return res.status(400).json({ error: "name is required." });

  if (Role.findByName(name))
    return res.status(409).json({ error: "Role name already exists." });

  const role = Role.create({ name, description, permissionIds });
  res.status(201).json({ message: "Role created successfully.", role });
});

// PUT /api/roles/:id
router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const role = Role.update(req.params.id, req.body);
  if (!role) return res.status(404).json({ error: "Role not found." });
  res.json({ message: "Role updated successfully.", role });
});

// DELETE /api/roles/:id
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const result = Role.delete(req.params.id);
  if (result === null) return res.status(404).json({ error: "Role not found." });
  if (result?.error) return res.status(400).json({ error: `Cannot delete role. ${result.error} user(s) are assigned to this role.` });
  res.json({ message: "Role deleted successfully." });
});

module.exports = router;