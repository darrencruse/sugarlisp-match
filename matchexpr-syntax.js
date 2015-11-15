var reader = require('sugarlisp-core/reader');

// infix type matching expression (e.g. "atom::lsatom", "list::lslist", etc)
// OLD DELETE exports['::'] = reader.infixtoprefix;
exports['::'] = reader.infix(1.5);

// COPIED THESE DOWN FROM SCRIPTY, NOW THAT I
// CREATE READER.SYMBOLS IN THE SYNTAX TABLE FOR
// KEYWORDS IN A DIALECT OMITTED FROM IT'S SYNTAX
// TABLE (WHICH DOES SEEM LOGICAL) - I'VE WOUND UP
// BREAKING THINGS IF SCRIPTY IS BEING USED,
// BECAUSE MATCH NOW SITS ON *TOP* OF SCRIPTY!!
// SO WITHOUT THE TWO ENTRIES BELOW, RIGHT NOW
// THE PAREN-FREE USE OF CASE AND DEFAULT DON'T
// WORK RIGHT THE SYNTAX HANDLERS FOR CASE AND
// AND DEFAULT DONT EVEN GET CALLED!  IT SEEMS
// LIKE MY ORIGINAL DESIGN WHERE SCRIPTY SAT
// ON *TOP* OF MATCH WAS THE RIGHT ONE?
// ISNT THAT A SIMPLE MATTER OF HAVING SCRIPTY
// EXTEND MATCH IN IT'S INDEX.JS FILE?

// match case/default do not need parens in scripty:
exports['case'] = reader.parenfree(2);
exports['default'] = reader.parenfree(1);
