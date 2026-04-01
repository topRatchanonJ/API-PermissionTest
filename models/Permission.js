const db = require("../config/database");

class Permission {
  static findAll() {
    return db.permissions;
  }

  static findById(id) {
    return db.permissions.find((p) => p.id === id) || null;
  }

  static findByIds(ids = []) {
    return db.permissions.filter((p) => ids.includes(p.id));
  }

  static findByNameAndResource(name, resource) {
    return db.permissions.find((p) => p.name === name && p.resource === resource) || null;
  }

  static create({ name, resource, description = "" }) {
    const newPermission = {
      id: db.generateId(),
      name,
      resource,
      description,
    };
    db.permissions.push(newPermission);
    return newPermission;
  }

  static update(id, { description }) {
    const index = db.permissions.findIndex((p) => p.id === id);
    if (index === -1) return null;

    if (description !== undefined) db.permissions[index].description = description;
    return db.permissions[index];
  }

  static delete(id) {
    // ตรวจสอบว่า role ใดใช้ permission นี้อยู่
    const rolesUsing = db.roles.filter((r) => r.permissionIds.includes(id));
    if (rolesUsing.length > 0) return { error: rolesUsing.map((r) => r.name) };

    const index = db.permissions.findIndex((p) => p.id === id);
    if (index === -1) return null;

    db.permissions.splice(index, 1);
    return true;
  }

  // Helper สำหรับ Dify: คืน permissions ในรูปแบบ "resource:name"
  static toDifyFormat(permissions = []) {
    return permissions.map((p) => `${p.resource}:${p.name}`);
  }
}

module.exports = Permission;