const mysql = require("mysql2/promise");
require("dotenv").config();

const poolConfig = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3333,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

const pool = mysql.createPool(poolConfig);

pool.getConnection()
  .then((conn) => {
    console.log("✅ Terhubung ke MariaDB");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ DB Error:", err);
    process.exit(-1);
  });

module.exports = pool;
