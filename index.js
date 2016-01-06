
module.exports = {
  name: "match",
  onuse: "sugarlisp-match/usematch.js",
  lextab: require('./lextab'),
  readtab: require('./readtab'),
  gentab: require('./gentab')
};
