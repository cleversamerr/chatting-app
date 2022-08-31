const AccessControl = require("accesscontrol");

const allRights = {
  "create:any": ["*"],
  "read:any": ["*"],
  "update:any": ["*"],
  "delete:any": ["*"],
};

let grantsObject = {
  teacher: {
    user: allRights,
    verificationCode: allRights,
    password: allRights,
  },
  student: {
    user: {
      "read:own": ["*"],
    },
    verificationCode: {
      "update:own": ["*"],
    },
    password: {
      "update:own": ["*"],
    },
  },
};

const roles = new AccessControl(grantsObject);

module.exports = roles;
