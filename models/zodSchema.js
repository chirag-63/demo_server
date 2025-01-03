const z = require("zod");

const signupSchema = z.object({
  name: z.string(),
  username: z.string(),
  password: z
    .string()
    .min(6, { message: "password must be 6 or more characters long" }),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6, {
    message: "password must be 6 or more characters long",
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
};
