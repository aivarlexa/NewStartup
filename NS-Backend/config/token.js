const jwt = require("jsonwebtoken");

const gentoken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

module.exports = gentoken;