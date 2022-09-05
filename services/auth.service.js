const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const { ApiError } = require("../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../config/errors");
const userService = require("./users.service");

module.exports.createUser = async (
  email,
  password,
  firstname,
  lastname,
  nickname = ""
) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const notValidNickname =
      nickname &&
      (typeof nickname !== "string" ||
        nickname.length < 4 ||
        nickname.length > 32);

    if (notValidNickname) {
      throw new ApiError(httpStatus.BAD_REQUEST, errors.auth.invalidNickname);
    }

    const user = new User({
      email,
      password: hashed,
      firstname,
      lastname,
      nickname,
    });
    await user.save();
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.signInWithEmailAndPassword = async (email, password) => {
  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, errors.auth.emailNotUsed);
    }

    if (!(await user.comparePassword(password))) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        errors.auth.incorrectCredentials
      );
    }

    return user;
  } catch (err) {
    throw err;
  }
};
