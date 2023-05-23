// const crypto = require("crypto");
const bcrypt = require("bcryptjs");

module.exports = function getRePassword(password) {
  // 生成鹽
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  return hashedPassword;
};
