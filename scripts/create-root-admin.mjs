import { randomBytes, scryptSync } from "node:crypto";
import Database from "better-sqlite3";

const username = "root";
const password = "capivara";

const salt = randomBytes(16).toString("hex");
const key = scryptSync(password, salt, 32);
const hash = `${salt}:${key.toString("hex")}`;

const sqlite = new Database("/opt/capygame/capygame.db");

const now = new Date().toISOString();

const existing = sqlite.prepare("SELECT id FROM users WHERE username = ?").get(username);
if (existing) {
  sqlite.prepare("UPDATE users SET passwordHash = ?, role = ?, updatedAt = ? WHERE username = ?")
    .run(hash, "admin", now, username);
  console.log(`User '${username}' updated with new password and admin role`);
} else {
  sqlite.prepare(`
    INSERT INTO users (openId, username, name, passwordHash, role, createdAt, updatedAt, lastSignedIn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`user_${username}`, username, username, hash, "admin", now, now, now);
  console.log(`User '${username}' created with admin role`);
}

sqlite.close();