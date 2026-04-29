let db = null
let SQL = null

/**
 * Load SQL.js — tries npm import first, then CDN fallback
 * Service worker will cache the CDN files for offline use
 */
async function loadSqlJs() {
  // Try loading from CDN (service worker will serve from cache when offline)
  if (window.initSqlJs) {
    return window.initSqlJs
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://sql.js.org/dist/sql-wasm.js'
    script.onload = () => resolve(window.initSqlJs)
    script.onerror = () => {
      console.warn('[DB] CDN load failed, checking service worker cache...')
      // If script tag fails, try fetch (service worker might intercept)
      fetch('https://sql.js.org/dist/sql-wasm.js')
        .then(res => res.text())
        .then(code => {
          // eslint-disable-next-line no-eval
          const fn = new Function(code)
          fn()
          resolve(window.initSqlJs)
        })
        .catch(reject)
    }
    document.head.appendChild(script)
  })
}

/**
 * Initialize SQL.js database
 */
export async function initDatabase() {
  if (db) return db

  // Load SQL.js (CDN with service worker cache fallback)
  const initSqlJs = window.initSqlJs || (await loadSqlJs())

  SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  })

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem('duitku_db')

  if (savedDb) {
    const uint8Array = new Uint8Array(JSON.parse(savedDb))
    db = new SQL.Database(uint8Array)
  } else {
    // Fallback: try IndexedDB
    try {
      const idbData = await loadFromIndexedDB()
      if (idbData) {
        db = new SQL.Database(new Uint8Array(idbData))
        console.log('[DB] Restored from IndexedDB backup')
      } else {
        db = new SQL.Database()
        await createTables()
        await seedDefaultData()
      }
    } catch {
      db = new SQL.Database()
      await createTables()
      await seedDefaultData()
    }
  }

  return db
}

/**
 * Create database tables
 */
async function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      is_default INTEGER DEFAULT 0,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      receipt_image TEXT,
      transaction_date DATE NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      recurring_frequency TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL,
      start_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `)

  saveDatabase()
}

/**
 * Seed default data (user and categories)
 */
async function seedDefaultData() {
  // Insert default user
  db.run(`
    INSERT INTO users (username, password)
    VALUES ('santoso', 'santoso123');
  `)

  // Default expense categories
  const expenseCategories = [
    { name: 'Makanan & Minuman', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { name: 'Rumah Tangga', icon: '🏠', color: '#45B7D1' },
    { name: 'Kesehatan', icon: '💊', color: '#96CEB4' },
    { name: 'Hiburan', icon: '🎮', color: '#FFEAA7' },
    { name: 'Belanja', icon: '🛒', color: '#DFE6E9' },
    { name: 'Pendidikan', icon: '📚', color: '#74B9FF' },
    { name: 'Bisnis', icon: '💼', color: '#A29BFE' },
    { name: 'Tagihan', icon: '💳', color: '#FD79A8' },
    { name: 'Lain-lain', icon: '🎁', color: '#B2BEC3' }
  ]

  expenseCategories.forEach(cat => {
    db.run(`
      INSERT INTO categories (name, type, icon, color, is_default, user_id)
      VALUES (?, 'expense', ?, ?, 1, 1);
    `, [cat.name, cat.icon, cat.color])
  })

  // Default income categories
  const incomeCategories = [
    { name: 'Gaji', icon: '💰', color: '#00B894' },
    { name: 'Freelance', icon: '💼', color: '#00CEC9' },
    { name: 'Investasi', icon: '📈', color: '#FDCB6E' },
    { name: 'Hadiah', icon: '🎁', color: '#E17055' },
    { name: 'Lainnya', icon: '💵', color: '#636E72' }
  ]

  incomeCategories.forEach(cat => {
    db.run(`
      INSERT INTO categories (name, type, icon, color, is_default, user_id)
      VALUES (?, 'income', ?, ?, 1, 1);
    `, [cat.name, cat.icon, cat.color])
  })

  saveDatabase()
}

/**
 * Save database to localStorage + IndexedDB for redundancy
 */
export function saveDatabase() {
  if (!db) return

  const data = db.export()
  const buffer = Array.from(data)
  localStorage.setItem('duitku_db', JSON.stringify(buffer))

  // Also save to IndexedDB as backup (handles larger data better)
  saveToIndexedDB(data).catch((err) => {
    console.warn('[DB] IndexedDB backup failed:', err)
  })
}

/**
 * Save database to IndexedDB
 */
function saveToIndexedDB(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('duitku_backup', 1)
    request.onupgradeneeded = (e) => {
      const idb = e.target.result
      if (!idb.objectStoreNames.contains('database')) {
        idb.createObjectStore('database')
      }
    }
    request.onsuccess = (e) => {
      const idb = e.target.result
      const tx = idb.transaction('database', 'readwrite')
      tx.objectStore('database').put(data, 'main')
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Load database from IndexedDB (fallback if localStorage is empty)
 */
function loadFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('duitku_backup', 1)
    request.onupgradeneeded = (e) => {
      const idb = e.target.result
      if (!idb.objectStoreNames.contains('database')) {
        idb.createObjectStore('database')
      }
    }
    request.onsuccess = (e) => {
      const idb = e.target.result
      const tx = idb.transaction('database', 'readonly')
      const getReq = tx.objectStore('database').get('main')
      getReq.onsuccess = () => resolve(getReq.result || null)
      getReq.onerror = () => reject(getReq.error)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Execute SQL query
 */
export function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized')

  try {
    const result = db.exec(sql, params)
    saveDatabase()
    return result
  } catch (error) {
    console.error('SQL Error:', error)
    throw error
  }
}

/**
 * Get single row
 */
export function queryOne(sql, params = []) {
  const result = query(sql, params)
  if (result.length === 0 || result[0].values.length === 0) return null

  const columns = result[0].columns
  const values = result[0].values[0]

  return columns.reduce((obj, col, idx) => {
    obj[col] = values[idx]
    return obj
  }, {})
}

/**
 * Get all rows
 */
export function queryAll(sql, params = []) {
  const result = query(sql, params)
  if (result.length === 0) return []

  const columns = result[0].columns
  const values = result[0].values

  return values.map(row => {
    return columns.reduce((obj, col, idx) => {
      obj[col] = row[idx]
      return obj
    }, {})
  })
}

/**
 * Insert and return last inserted ID
 */
export function insert(sql, params = []) {
  query(sql, params)
  const result = queryOne('SELECT last_insert_rowid() as id')
  return result.id
}

/**
 * Clear all data (for testing)
 */
export function clearDatabase() {
  localStorage.removeItem('duitku_db')
  db = null
}

export default {
  initDatabase,
  saveDatabase,
  query,
  queryOne,
  queryAll,
  insert,
  clearDatabase
}
