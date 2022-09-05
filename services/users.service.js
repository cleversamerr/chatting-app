const mongoose = require("mongoose");
const { User } = require("../models/user.model");
const emailService = require("./email.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth: errors } = require("../config/errors");
const { ApiError } = require("../middleware/apiError");
const httpStatus = require("http-status");
const fs = require("fs");
const crypto = require("crypto");

module.exports.findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.validateToken = (token) => {
  try {
    return jwt.verify(token, process.env["JWT_PRIVATE_KEY"]);
  } catch (err) {
    throw err;
  }
};

module.exports.unjoinUsersFromRoom = async (userIds, roomId) => {
  try {
    await User.updateMany(
      { _id: { $in: userIds } },
      { $pull: { rooms: mongoose.Types.ObjectId(roomId) } },
      { new: true }
    );
  } catch (err) {
    throw err;
  }
};

module.exports.updateProfile = async (req) => {
  try {
    let user = req.user;
    const { avatarAsBase64, firstname, lastname, email, password, nickname } =
      req.body;

    if (
      !avatarAsBase64 &&
      !firstname &&
      !lastname &&
      !email &&
      !password &&
      !nickname
    ) {
      return user;
    }

    validateString(firstname, 1, 64, "invalidName");
    validateString(lastname, 1, 64, "invalidName");
    validateEmail(email, "invalidEmail");
    validateString(password, 8, 32, "invalidPassword");
    validateString(nickname, 4, 32, "invalidNickname");

    if (avatarAsBase64) {
      const data = avatarAsBase64.split(",");
      const extension = data[0].split("/")[1].split(";")[0];
      const content = data[1];
      const readFile = Buffer.from(content, "base64");
      const diskName = crypto.randomUUID();
      fs.writeFileSync(`./uploads/${diskName}.${extension}`, readFile, "utf8");
      user.avatarUrl = `/${diskName}.${extension}`;
    }

    if (firstname && user.firstname !== firstname) {
      user.firstname = firstname;
    }

    if (lastname && user.lastname !== lastname) {
      user.lastname = lastname;
    }

    if (nickname && user.nickname !== nickname) {
      user.nickname = nickname;
    }

    if (password) {
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        user.password = hashed;
      }
    }

    if (email && user.email !== email) {
      user.email = email;
      user.verified = false;
    }

    const newUser = await user.save();

    if (email && user.email !== email) {
      await emailService.registerEmail(email, user);
    }

    return newUser;
  } catch (err) {
    throw err;
  }
};

const validateEmail = (email, err) => {
  const valid =
    !email ||
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  if (!valid) {
    throw new ApiError(httpStatus.BAD_REQUEST, errors[err]);
  }

  return valid;
};

const validateString = (str, min, max, err) => {
  const valid =
    !str || (typeof str === "string" && str.length >= min && str.length <= max);

  if (!valid) {
    throw new ApiError(httpStatus.BAD_REQUEST, errors[err]);
  }

  return valid;
};
