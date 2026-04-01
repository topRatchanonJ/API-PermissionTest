const express = require("express");
const router = express.Router();

// Mock Models
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

// Middleware
const { authenticate } = require("../middleware/auth");
const { 
  requireAdmin, 
  authorizeAccess, 
  getUserPermissionsData 
} = require("../middleware/permission");

/**
 * [NEW] [GET] /api/users/me/permissions
 * ✨ เพิ่มมาเพื่อแก้ปัญหา 404 ใน Dify
 * กฎ: ใช้ตรวจสอบ Token ของตัวเอง ไม่ต้องระบุ ID ใน URL
 */
router.get("/me/permissions", authenticate, (req, res) => {
  // เมื่อผ่าน authenticate มาได้ req.user จะมีข้อมูลทันที
  const data = getUserPermissionsData(req.user.id);

  if (!data) return res.status(404).json({ error: "ไม่พบข้อมูลสิทธิ์ของคุณ" });

  res.json({
    status: "success",
    is_self_check: true,
    data: data
  });
});

/**
 * [GET] /api/users/:id/permissions
 * กฎ: Admin ดูได้ทุกคน / User ดูได้แค่ของตัวเอง
 */
router.get("/:id/permissions", authenticate, authorizeAccess, (req, res) => {
  const { id } = req.params;
  
  // ป้องกันกรณี Dify ส่งค่าที่มาจากการพิมพ์ของ User (ไม่ใช่ตัวเลข)
  if (isNaN(id) && id !== 'me') {
     return res.status(400).json({ error: "Invalid User ID format." });
  }

  const data = getUserPermissionsData(id);
  if (!data) return res.status(404).json({ error: "User permissions not found." });

  res.json(data);
});

/**
 * [GET] /api/users
 * กฎ: เฉพาะ Admin หรือ Dify (Internal Key)
 */
router.get("/", authenticate, requireAdmin, (req, res) => {
  const users = User.findAll();
  res.json({ 
    total: users.length, 
    requested_by: req.user.username,
    users 
  });
});

/**
 * [GET] /api/users/:id
 */
router.get("/:id", authenticate, authorizeAccess, (req, res) => {
  const { id } = req.params;
  const user = User.findById(id);
  
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งานในระบบ" });

  const role = Role.findById(user.roleId);
  const permissions = Permission.findByIds(role?.permissionIds || []);

  res.json({ 
    status: "success",
    data: { ...user, role, permissions }
  });
});

/**
 * [PUT] /api/users/:id
 */
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    if (roleId && !Role.findById(roleId))
      return res.status(400).json({ error: "Role ที่ระบุไม่ถูกต้อง" });

    const user = await User.update(id, req.body);
    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });

    res.json({ message: "อัปเดตข้อมูลสำเร็จ", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * [DELETE] /api/users/:id
 */
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;

  if (id === String(req.user.id))
    return res.status(400).json({ error: "คุณไม่สามารถลบบัญชีตัวเองได้" });

  const deleted = User.delete(id);
  if (!deleted) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });

  res.json({ message: "ลบผู้ใช้งานสำเร็จ" });
});

module.exports = router;