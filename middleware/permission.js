const db = require("../config/database");

/**
 * Middleware: ตรวจสอบสิทธิ์การเข้าถึงข้อมูล User (Layered Access)
 * กฎ: 
 * - Guest: เข้าไม่ได้เลย (403)
 * - Admin/Dify: ดูได้ทุกคน
 * - Editor/User: ดูได้เฉพาะของตัวเอง
 */
const authorizeAccess = (req, res, next) => {
  const requestedId = req.params.id; // ID ที่เรียกจาก URL

  // 1. ดัก Guest (คนไม่ Login) -> ห้ามดูข้อมูล User เด็ดขาด
  if (!req.user) {
    return res.status(403).json({ 
      error: "Access denied. กรุณาเข้าสู่ระบบเพื่อเข้าถึงข้อมูลส่วนนี้" 
    });
  }

  // 2. Bypass สำหรับ Dify หรือ Admin -> ดูได้หมด
  if (req.user.id === "system-dify" || req.user.role === "admin") {
    return next();
  }

  // 3. สำหรับ User/Editor ทั่วไป -> ต้องเป็นเจ้าของข้อมูลเท่านั้น
  if (req.user.id === requestedId) {
    return next();
  }

  // 4. กรณีอื่นๆ (แอบดูของคนอื่น) -> ปฏิเสธ
  return res.status(403).json({ 
    error: "Access denied. คุณมีสิทธิ์เข้าถึงเฉพาะข้อมูลของตัวเองเท่านั้น" 
  });
};

/**
 * Middleware: สำหรับเส้นทางที่ Admin เท่านั้นที่ทำได้ (เช่น ดูรายชื่อทั้งหมด / ลบ User)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }

  if (req.user.id === "system-dify" || req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่เข้าถึงส่วนนี้ได้" });
};

/**
 * Helper: ดึงข้อมูลสิทธิ์ (สำหรับ Response ของ Dify)
 */
const getUserPermissionsData = (userId) => {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  const role = db.roles.find((r) => r.id === user.roleId);
  const permissions = db.permissions.filter((p) =>
    role?.permissionIds.includes(p.id)
  );

  return {
    userId: user.id,
    username: user.username,
    role: role?.name || "no role",
    permissions: permissions.map((p) => p.name),
    difyPermissions: permissions.map((p) => `${p.resource}:${p.name}`),
  };
};

module.exports = { requireAdmin, authorizeAccess, getUserPermissionsData };