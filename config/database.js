// In-Memory Database (ใช้แทน Database จริง เช่น MongoDB, PostgreSQL)
// สามารถเปลี่ยนเป็น Database จริงได้ภายหลัง

const db = {
  users: [
    {
      id: "1",
      username: "admin",
      password: "$2b$10$rQZ9uAVn6Z1Kq5Y5v9X5/.hash", // hash ของ "admin123"
      email: "admin@example.com",
      roleId: "1",
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      username: "user1",
      password: "$2b$10$rQZ9uAVn6Z1Kq5Y5v9X5/.hash", // hash ของ "user123"
      email: "user1@example.com",
      roleId: "2",
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],

  roles: [
    {
      id: "1",
      name: "admin",
      description: "Administrator with full access",
      permissionIds: ["1", "2", "3", "4", "5", "6"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "editor",
      description: "Can read and write content",
      permissionIds: ["1", "2"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "viewer",
      description: "Read only access",
      permissionIds: ["1"],
      createdAt: new Date().toISOString(),
    },
  ],

  permissions: [
    { id: "1", name: "read", resource: "content", description: "Can read content" },
    { id: "2", name: "write", resource: "content", description: "Can write content" },
    { id: "3", name: "delete", resource: "content", description: "Can delete content" },
    { id: "4", name: "manage_users", resource: "users", description: "Can manage users" },
    { id: "5", name: "manage_roles", resource: "roles", description: "Can manage roles" },
    { id: "6", name: "manage_permissions", resource: "permissions", description: "Can manage permissions" },
  ],

  // สำหรับเก็บ token blacklist (logout)
  revokedTokens: [],
};

// Helper: generate simple ID
db.generateId = () => Date.now().toString();

module.exports = db;