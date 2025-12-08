// passwordUtils.js
const bcrypt = require("bcrypt");

const saltRounds = 10;

module.exports = {
  async hash(password) {
    return await bcrypt.hash(password, saltRounds);
  },

  async verify(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
};