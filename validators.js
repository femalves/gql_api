import { UserInputError } from "apollo-server-express";
import passwordValidator from "password-validator";
import { isEmail } from "validator";

const passwordSchema = new passwordValidator()
  .is()
  .min(8)
  .is()
  .max(20)
  .has()
  .letters()
  .has()
  .digits()
  .has()
  .symbols()
  .has()
  .not()
  .spaces();

export const validators = {
  Mutation: {
    signup: (resolve, parent, args, context) => {
      const { email, password, rePassword } = args.signupReq;

      if (!isEmail(email)) {
        throw new UserInputError("Invalid email address.");
      }

      if (password !== rePassword) {
        throw new UserInputError("Passwords don't match.");
      }

      if (!passwordSchema.validate(password)) {
        throw new UserInputError("Password is not strong enough.");
      }
      return resolve(parent, args, context);
    },
  },
};
