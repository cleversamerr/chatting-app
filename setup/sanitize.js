const { json, urlencoded, static } = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

module.exports = (app) => {
  app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use(cors({ origin: true }));
  app.set("view engine", "ejs");
  app.use(static("public"));
  app.use(xss());
  app.use(mongoSanitize());
};
