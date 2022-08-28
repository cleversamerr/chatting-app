const setupSanitization = require("./sanitize");
const setupMongoDB = require("./db");
const routes = require("../routes");
const config = require("../config.json");
const passport = require("passport");
const { jwtStrategy } = require("../middleware/passport");
const {
  errorHandler,
  errorConverter,
  unsupportedRouteHandler,
} = require("../middleware/apiError");

module.exports = (app) => {
  setupMongoDB();
  setupSanitization(app);
  app.use(passport.initialize());
  passport.use("jwt", jwtStrategy);
  app.use("/api", routes);
  app.use(unsupportedRouteHandler);
  app.use(errorConverter);
  app.use(errorHandler);

  const PORT = process.env.PORT || config.development.port;
  app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
  });
};
