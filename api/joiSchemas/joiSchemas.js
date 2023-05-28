const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().max(30).required().regex(/^\S+$/),
  password: Joi.string().max(20).required().min(6),
});

const loginUserSchema = Joi.object({
  username: Joi.string().max(30).required().regex(/^\S+$/),
  password: Joi.string().max(20).required(),
});

module.exports = {
  createUserSchema,
  loginUserSchema,
};
