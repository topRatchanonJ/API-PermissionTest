const express = require("express");
const router = express.Router();
const Permission = require("../models/Permission");
const { authenticate } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/permission");

// GET /api/permissions
router.get("/", authenticate, (req, res) => {
  const permissions = Permission.findAll();
  res.json({ total: permissions.length, permissions });
});

// GET /api/permissions/:id
router.get("/:id", authenticate, (req, res) => {
  const permission = Permission.findById(req.params.id);
  if (!permission) return res.status(404).json({ error: "Permission not found." });
  res.json(permission);
});

// POST /api/permissions
router.post("/", authenticate, requireAdmin, (req, res) => {
  const { name, resource, description } = req.body;
  if (!name || !resource)
    return res.status(400).json({ error: "name and resource are required." });

  if (Permission.findByNameAndResource(name, resource))
    return res.status(409).json({ error: "Permission already exists for this resource." });

  const permission = Permission.create({ name, resource, description });
  res.status(201).json({ message: "Permission created successfully.", permission });
});

// PUT /api/permissions/:id
router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const permission = Permission.update(req.params.id, req.body);
  if (!permission) return res.status(404).json({ error: "Permission not found." });
  res.json({ message: "Permission updated successfully.", permission });
});

// DELETE /api/permissions/:id
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const result = Permission.delete(req.params.id);
  if (result === null) return res.status(404).json({ error: "Permission not found." });
  if (result?.error) return res.status(400).json({ error: `Cannot delete permission. Used by roles: ${result.error.join(", ")}` });
  res.json({ message: "Permission deleted successfully." });
});

module.exports = router;