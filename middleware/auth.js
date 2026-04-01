const jwt = require("jsonwebtoken");
// สมมติว่าคุณมีไฟล์ config หรือใช้ db ชั่วคราวเก็บ revokedTokens
const db = require("../config/database"); 

const JWT_SECRET = process.env.JWT_SECRET || "SDB_CHAT_AI_SECRET_2026";
const INTERNAL_SECRET_KEY = "SDB_CHAT_AI_SECRET_2026"; 

const authenticate = (req, res, next) => {
    const internalKey = req.headers["x-internal-key"];
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // 1. เช็ค Internal Key (สำหรับ Dify Agent ที่มีกุญแจผี)
    if (internalKey === INTERNAL_SECRET_KEY) {
        req.user = { id: "system", username: "dify_agent", role: "admin" };
        return next();
    }

    // 2. ถ้าไม่มี Token เลย -> บล็อก 401 (Dify จะวิ่งไปหา LLM General)
    if (!token) {
        return res.status(401).json({ 
            error: "Unauthorized", 
            message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" 
        });
    }

    // 3. ตรวจสอบ Token
    try {
        // เช็คว่า Token โดนแบนไหม (Logout ไปแล้วหรือยัง)
        if (db.revokedTokens && db.revokedTokens.includes(token)) {
            return res.status(401).json({ error: "Revoked", message: "Token นี้ถูกยกเลิกแล้ว" });
        }

        // ตรวจสอบความถูกต้องและลายเซ็น (Verify)
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // ในนี้จะมี { id, username, role }
        req.token = token;
        next(); // ผ่าน!
    } catch (err) {
        // 🛡️ ถ้า Token มั่ว หรือ หมดอายุ -> บล็อก 401 ทันที
        return res.status(401).json({ 
            error: "Invalid Token", 
            message: "Token ไม่ถูกต้องหรือหมดอายุ รบกวน Login ใหม่" 
        });
    }
};

module.exports = { authenticate, JWT_SECRET };