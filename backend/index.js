const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'good-girl-points-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database setup - use absolute path for production
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/database.sqlite' 
  : './database.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      pointBalance INTEGER DEFAULT 0
    )`);

    // Rewards table
    db.run(`CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      pointCost INTEGER NOT NULL
    )`);

    // Redemptions table
    db.run(`CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      rewardId TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (rewardId) REFERENCES rewards (id)
    )`);

    // Point logs table
    db.run(`CREATE TABLE IF NOT EXISTS pointLogs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      actionType TEXT NOT NULL,
      reason TEXT,
      points INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Notifications table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Insert default users
    const defaultUsers = [
      { id: uuidv4(), username: 'anthony', password: 'admin123', role: 'admin', pointBalance: 0 },
      { id: uuidv4(), username: 'joep', password: 'user123', role: 'user', pointBalance: 100 }
    ];

    defaultUsers.forEach(user => {
      bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        db.run(`INSERT OR IGNORE INTO users (id, username, password, role, pointBalance) VALUES (?, ?, ?, ?, ?)`,
          [user.id, user.username, hash, user.role, user.pointBalance],
          (err) => {
            if (err) {
              console.error('Error inserting user:', err);
            }
          }
        );
      });
    });

    // Insert some default rewards
    const defaultRewards = [
      { id: uuidv4(), name: 'Movie Night', description: 'Watch your favorite movie together', pointCost: 50 },
      { id: uuidv4(), name: 'Dinner Date', description: 'Go out for a nice dinner', pointCost: 100 },
      { id: uuidv4(), name: 'Massage', description: 'Relaxing massage session', pointCost: 75 },
      { id: uuidv4(), name: 'Gaming Time', description: 'Extra gaming time together', pointCost: 25 }
    ];

    defaultRewards.forEach(reward => {
      db.run(`INSERT OR IGNORE INTO rewards (id, name, description, pointCost) VALUES (?, ?, ?, ?)`,
        [reward.id, reward.name, reward.description, reward.pointCost],
        (err) => {
          if (err) {
            console.error('Error inserting reward:', err);
          }
        }
      );
    });
  });
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          pointBalance: user.pointBalance
        }
      });
    });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/me', requireAuth, (req, res) => {
  db.get('SELECT id, username, role, pointBalance FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

// Dashboard routes
app.get('/api/dashboard', requireAuth, (req, res) => {
  if (req.session.role === 'admin') {
    // Admin dashboard - get joep's info
    db.get('SELECT id, username, pointBalance FROM users WHERE username = ?', ['joep'], (err, joep) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get recent redemptions
      db.all(`
        SELECT r.id, r.timestamp, rew.name as rewardName, rew.pointCost
        FROM redemptions r
        JOIN rewards rew ON r.rewardId = rew.id
        JOIN users u ON r.userId = u.id
        WHERE u.username = 'joep'
        ORDER BY r.timestamp DESC
        LIMIT 5
      `, [], (err, redemptions) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Get recent notifications
        db.all(`
          SELECT message, timestamp
          FROM notifications
          WHERE userId = ?
          ORDER BY timestamp DESC
          LIMIT 5
        `, [joep.id], (err, notifications) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            joep: {
              id: joep.id,
              username: joep.username,
              pointBalance: joep.pointBalance
            },
            recentRedemptions: redemptions,
            recentNotifications: notifications
          });
        });
      });
    });
  } else {
    // User dashboard
    db.get('SELECT pointBalance FROM users WHERE id = ?', [req.session.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get recent activity
      db.all(`
        SELECT actionType, reason, points, timestamp
        FROM pointLogs
        WHERE userId = ?
        ORDER BY timestamp DESC
        LIMIT 10
      `, [req.session.userId], (err, activity) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          pointBalance: user.pointBalance,
          recentActivity: activity
        });
      });
    });
  }
});

// Rewards routes
app.get('/api/rewards', requireAuth, (req, res) => {
  db.all('SELECT * FROM rewards ORDER BY pointCost ASC', [], (err, rewards) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ rewards });
  });
});

app.post('/api/rewards', requireAdmin, (req, res) => {
  const { name, description, pointCost } = req.body;
  const id = uuidv4();

  db.run('INSERT INTO rewards (id, name, description, pointCost) VALUES (?, ?, ?, ?)',
    [id, name, description, pointCost], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, name, description, pointCost });
    });
});

app.put('/api/rewards/:id', requireAdmin, (req, res) => {
  const { name, description, pointCost } = req.body;
  const { id } = req.params;

  db.run('UPDATE rewards SET name = ?, description = ?, pointCost = ? WHERE id = ?',
    [name, description, pointCost, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, name, description, pointCost });
    });
});

app.delete('/api/rewards/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM rewards WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Reward deleted successfully' });
  });
});

// Redemption routes
app.post('/api/redeem', requireAuth, (req, res) => {
  const { rewardId } = req.body;

  // Get reward details
  db.get('SELECT * FROM rewards WHERE id = ?', [rewardId], (err, reward) => {
    if (err || !reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    // Check user's balance
    db.get('SELECT pointBalance FROM users WHERE id = ?', [req.session.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user.pointBalance < reward.pointCost) {
        return res.status(400).json({ error: 'Insufficient points' });
      }

      // Process redemption
      const redemptionId = uuidv4();
      const newBalance = user.pointBalance - reward.pointCost;

      db.serialize(() => {
        // Update user balance
        db.run('UPDATE users SET pointBalance = ? WHERE id = ?', [newBalance, req.session.userId]);

        // Create redemption record
        db.run('INSERT INTO redemptions (id, userId, rewardId) VALUES (?, ?, ?)',
          [redemptionId, req.session.userId, rewardId]);

        // Log the redemption
        db.run('INSERT INTO pointLogs (id, userId, actionType, reason, points) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), req.session.userId, 'Redemption', `Redeemed: ${reward.name}`, -reward.pointCost]);

        // Notify admin
        db.get('SELECT id FROM users WHERE username = ?', ['anthony'], (err, admin) => {
          if (!err && admin) {
            db.run('INSERT INTO notifications (id, userId, message) VALUES (?, ?, ?)',
              [uuidv4(), admin.id, `${req.session.username} redeemed ${reward.name} for ${reward.pointCost} points`]);
          }
        });

        res.json({
          message: 'Reward redeemed successfully!',
          newBalance,
          redemption: {
            id: redemptionId,
            rewardName: reward.name,
            pointCost: reward.pointCost,
            timestamp: new Date().toISOString()
          }
        });
      });
    });
  });
});

// Points management routes
app.post('/api/points', requireAdmin, (req, res) => {
  const { userId, actionType, points, reason } = req.body;

  db.get('SELECT pointBalance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pointChange = actionType === 'Add' ? points : -points;
    const newBalance = user.pointBalance + pointChange;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Balance cannot go below 0' });
    }

    db.serialize(() => {
      // Update balance
      db.run('UPDATE users SET pointBalance = ? WHERE id = ?', [newBalance, userId]);

      // Log the action
      db.run('INSERT INTO pointLogs (id, userId, actionType, reason, points) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), userId, actionType, reason, pointChange]);

      // Notify user
      db.run('INSERT INTO notifications (id, userId, message) VALUES (?, ?, ?)',
        [uuidv4(), userId, `${actionType === 'Add' ? 'Added' : 'Removed'} ${points} points: ${reason}`]);

      res.json({
        message: 'Points updated successfully',
        newBalance,
        action: {
          type: actionType,
          points: pointChange,
          reason,
          timestamp: new Date().toISOString()
        }
      });
    });
  });
});

// History routes
app.get('/api/history', requireAuth, (req, res) => {
  db.all(`
    SELECT actionType, reason, points, timestamp
    FROM pointLogs
    WHERE userId = ?
    ORDER BY timestamp DESC
  `, [req.session.userId], (err, history) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ history });
  });
});

// Notifications routes
app.get('/api/notifications', requireAuth, (req, res) => {
  db.all(`
    SELECT message, timestamp
    FROM notifications
    WHERE userId = ?
    ORDER BY timestamp DESC
    LIMIT 20
  `, [req.session.userId], (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ notifications });
  });
});

// Admin routes
app.get('/api/admin/redemptions', requireAdmin, (req, res) => {
  db.all(`
    SELECT r.id, r.timestamp, u.username, rew.name as rewardName, rew.pointCost
    FROM redemptions r
    JOIN users u ON r.userId = u.id
    JOIN rewards rew ON r.rewardId = rew.id
    ORDER BY r.timestamp DESC
  `, [], (err, redemptions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ redemptions });
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  db.all('SELECT id, username, role, pointBalance FROM users', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ users });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    session: req.session,
    user: req.session.userId ? 'logged in' : 'not logged in'
  });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 