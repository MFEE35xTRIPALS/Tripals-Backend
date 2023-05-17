// 註冊登入輸入判斷

const Joi = require("joi");

const registerValidation = (data) => {
  // schema內描述會員資料必要的東西
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });
  // 回傳boolean
  return schema.validate(data);
};

const loginValidation = (data) => {
  // schema內描述會員資料必要的東西
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });
  // 回傳boolean
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
