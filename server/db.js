import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database inside server folder
const dbPath = path.resolve(__dirname, 'flowr.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable Foreign Keys support
db.pragma('foreign_keys = ON');

console.log(`SQLite database connected at: ${dbPath}`);

// Create database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    zone_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY(zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS switches (
    id TEXT PRIMARY KEY,
    from_zone_id TEXT,
    to_zone_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    estimated_time_lost_seconds INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    badge_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    unlocked_at TEXT NOT NULL,
    user_id TEXT NOT NULL,
    UNIQUE(user_id, badge_type),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Pre-populate with guest user and initial mockup dataset if empty
const initMockData = () => {
  const userCheck = db.prepare('SELECT id FROM users WHERE id = ?').get('guest-user');
  
  if (!userCheck) {
    console.log('Pre-populating SQLite database with default FLOWR dataset...');
    
    // Insert Guest User (password is 'focus123')
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, created_at) 
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'guest-user',
      'flowr-focus@deepmind.com',
      'Focus Builder',
      '$2a$10$wNnQ.j2YFfGvV7B9/21.iOM55p8L3z9n26Bv2B9R673d328R21S92', // hash for 'focus123'
      new Date().toISOString()
    );

    // Insert Default Zones
    const insertZone = db.prepare(`
      INSERT INTO zones (id, name, description, color, created_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertZone.run('z-deep-code', '💻 Deep Code', 'Coding, refactoring, building architecture. Focus block.', 'emerald', new Date().toISOString(), 'guest-user');
    insertZone.run('z-comms', '💬 Comms & Sync', 'Slack, emails, pull request reviews, team chats.', 'blue', new Date().toISOString(), 'guest-user');
    insertZone.run('z-admin', '⚙️ Admin & Planning', 'Jira tickets, scheduling, timesheets, documentation.', 'purple', new Date().toISOString(), 'guest-user');

    // Insert Default Tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, completed, zone_id, user_id, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run('t1', 'Implement Flow Guardian Fullscreen Interface', 'Build a distraction-free immersive layout for active zones.', 0, 'z-deep-code', 'guest-user', new Date().toISOString(), null);
    insertTask.run('t2', 'Establish SQLite database schema', 'Design robust SQLite database tables for users, tasks, and switches.', 0, 'z-deep-code', 'guest-user', new Date().toISOString(), null);
    insertTask.run('t3', 'Write core custom transition animations', 'Add circular breath animations and sliding effects.', 1, 'z-deep-code', 'guest-user', new Date().toISOString(), new Date().toISOString());
    insertTask.run('t4', 'Review PR for frontend analytics charts', 'Check team submissions for whiplash streak stats.', 0, 'z-comms', 'guest-user', new Date().toISOString(), null);
    insertTask.run('t5', 'Respond to Design Review email thread', 'Provide feedback on typography and layout decisions.', 0, 'z-comms', 'guest-user', new Date().toISOString(), null);
    insertTask.run('t6', 'Log sprint planning notes', 'Update the backlog in Asana/Jira with next week tasks.', 0, 'z-admin', 'guest-user', new Date().toISOString(), null);
  }
};

initMockData();

export default db;
