const db = require("../config/database");
const Permission = require("./Permission");

class Role {
  static findAll() {
    return db.roles.map((role) => ({
      ...role,
      permissions: Permission.findByIds(role.permissionIds),
    }));
  }

  static findById(id) {
    const role = db.roles.find((r) => r.id === id);
    if (!role) return null;
    return { ...role, permissions: Permission.findByIds(role.permissionIds) };
  }

  static findByName(name) {
    return db.roles.find((r) => r.name === name) || null;
  }

  static create({ name, description = "", permissionIds = [] }) {
    const validPermissionIds = permissionIds.filter((pid) =>
      db.permissions.find((p) => p.id === pid)
    );
    const newRole = {
      id: db.generateId(),
      name,
      description,
      permissionIds: validPermissionIds,
      createdAt: new Date().toISOString(),
    };
    db.roles.push(newRole);
    return { ...newRole, permissions: Permission.findByIds(newRole.permissionIds) };
  }

  static update(id, { description, permissionIds }) {
    const index = db.roles.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const role = db.roles[index];
    if (description !== undefined) role.description = description;
    if (permissionIds) {
      role.permissionIds = permissionIds.filter((pid) =>
        db.permissions.find((p) => p.id === pid)
      );
    }
    db.roles[index] = role;
    return { ...role, permissions: Permission.findByIds(role.permissionIds) };
  }

  static delete(id) {
    // ตรวจสอบว่ามี user ใช้งาน role นี้อยู่
    const usersWithRole = db.users.filter((u) => u.roleId === id);
    if (usersWithRole.length > 0) return { error: usersWithRole.length };

    const index = db.roles.findIndex((r) => r.id === id);
    if (index === -1) return null;

    db.roles.splice(index, 1);
    return true;
  }
}

module.exports = Role;