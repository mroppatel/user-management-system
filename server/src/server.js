require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");
const redisClient = require("./config/redis");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("MySQL connected and models synced");

    // try {
    //   await redisClient.connect();
    //   console.log("Redis connected");
    // } catch (e) {
    //   console.warn("Redis not connected:", e.message);
    // }

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error("Startup error", err);
    process.exit(1);
  }
})();
