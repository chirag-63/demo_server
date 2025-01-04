const z = require("zod");

const signupSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(2),
  password: z
    .string()
    .min(6, { message: "password must be 6 or more characters long" }),
});

const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6, {
    message: "password must be 6 or more characters long",
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
};
