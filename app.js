const express = require("express");
const cors = require("cors"); // 1. เพิ่มการนำเข้า cors
const app = express();

// 2. ต้องวาง app.use(cors()) ไว้ "ก่อน" พวก Routes นะครับ
// เพื่อให้มันอนุญาต Request ตั้งแต่ก้าวแรกที่เข้ามา
app.use(cors()); 

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roleRoutes = require("./routes/roles");
const permissionRoutes = require("./routes/permissions");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;