const develocityReporter = require.resolve("@gradle-tech/develocity-agent/mocha-reporter");

module.exports = {
  reporter: develocityReporter,
};
