const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); 
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roleRoutes = require("./routes/roles");
const permissionRoutes = require("./routes/permissions");

// --- แก้ไขลำดับตรงนี้ ---
// เอา users ขึ้นก่อน และเช็คว่าใน authRoutes ไม่มีเส้นที่ซ้ำซ้อน
app.use("/api/users", userRoutes); 
app.use("/api/auth", authRoutes);
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