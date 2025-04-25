const mysql = require("mysql2");
const config = require("./env");

// MYSQL DATABASE CONNECTION POOL
const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// MYSQL DATABASE CONNECTION POOL PROMISE
const promisePool = pool.promise();

module.exports = promisePool;
