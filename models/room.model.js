const mongoose = require("mongoose");

const clientSchema = [
  "_id",
  "name",
  "showName",
  "author",
  "pinnedMessages",
  "members",
  "chatDisabled",
  "status",
  "blockList",
];

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    author: {
      type: Object,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      trim: true,
    },
    pinnedMessages: {
      type: Array,
      default: [],
    },
    members: {
      type: Array,
      default: [],
    },
    chatDisabled: {
      type: Boolean,
      default: false,
    },
    blockList: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: ["private", "public"],
      default: "public",
    },
  },
  { minimize: false }
);

roomSchema.index({ name: "text" });

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room, clientSchema };
