const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static findAll() {
    return db.users.map(({ password, ...rest }) => {
      const role = db.roles.find((r) => r.id === rest.roleId);
      return { ...rest, role: role ? { id: role.id, name: role.name } : null };
    });
  }

  static findById(id) {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  static findByUsername(username) {
    return db.users.find((u) => u.username === username) || null;
  }

  static findByEmail(email) {
    return db.users.find((u) => u.email === email) || null;
  }

  static async create({ username, email, password, roleId = "3" }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: db.generateId(),
      username,
      email,
      password: hashedPassword,
      roleId,
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    const { password: _, ...rest } = newUser;
    return rest;
  }

  static async update(id, { email, password, roleId, active }) {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const user = db.users[index];
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (roleId) user.roleId = roleId;
    if (typeof active === "boolean") user.active = active;

    db.users[index] = user;
    const { password: _, ...rest } = user;
    return rest;
  }

  static delete(id) {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    db.users.splice(index, 1);
    return true;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;