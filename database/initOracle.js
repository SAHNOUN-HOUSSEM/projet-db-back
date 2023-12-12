const oracledb = require("oracledb");
// Oracle DB connection pool
async function initOracle() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMax: 4,
      poolMin: 2,
      poolIncrement: 1,
      poolTimeout: 60,
    });
    console.log("Oracle Database pool created.");
  } catch (err) {
    console.error("Error creating Oracle Database pool:", err.message);
  }
}

module.exports = initOracle;
