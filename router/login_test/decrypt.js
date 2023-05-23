const bcrypt = require("bcryptjs");

module.exports = function validatePassword(password, encryptedPassword) {
  const isPasswordMatch = bcrypt.compareSync(password, encryptedPassword);
  return isPasswordMatch;
};
