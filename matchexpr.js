
// Local dialect (syntax and keywords) for just
// the "match" expression alone.  This makes
// the "::" syntax, "case" and "default" local
// to the match dialect rather than global

module.exports = {
  type: "mixin",
// UNCOMMENT THE BELOW AND PUT IT BACK??  NOT SURE YET!!!
//  extends: ["match"],
  syntax: require('./matchexpr-syntax'),
  keywords: require('./matchexpr-keywords')
};
