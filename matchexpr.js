
// Local dialect (syntax and keywords) for just
// the "match" expression alone.  This makes
// the "::" syntax, "case" and "default" local
// to the match dialect rather than global

module.exports = {
  readtab: require('./matchexpr-readtab'),
  gentab: require('./matchexpr-gentab')
};
