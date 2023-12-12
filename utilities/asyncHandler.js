const oracledb = require("oracledb");

const asyncHandler = (callback) => {
  return async (req, res, next) => {
    const connection = await oracledb.getConnection();
    try {
      await callback(req, res, next, connection);
      await connection.commit();
    } catch (err) {
      next(err);
    } finally {
      try {
        // Close the individual connection
        if (connection) await connection.close();
      } catch (error) {
        console.error("Error closing individual connection:", error.message);
      }
    }
  };
};

module.exports = asyncHandler;
