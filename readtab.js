var sl = require('sugarlisp-core/sl-types'),
    reader = require('sugarlisp-core/reader'),
    utils = require('sugarlisp-core/utils'),
    debug = require('debug')('sugarlisp:match:readtab');

// this is a paren free version of the "match" statement syntax
// note they don't have to use the paren free syntax
exports['match'] = function(lexer) {

  // the list form for this match expression
  var list = sl.list();

  var matchToken = lexer.next_token('match');
  var matchAgainstList = reader.read(lexer);
  if(!(Array.isArray(matchAgainstList))) {
    lexer.error("the expression to match must be surrounded by parentheses");
  }
  // the parens are just syntax sugar - reach inside:
  var matchAgainst = matchAgainstList[0];

  list.push(sl.atom("match", {token: matchToken}));
  list.push(matchAgainst);

  // the match cases are expected to be a single form surrounded by {}
  list.push(reader.read(lexer));

  list.__parenoptional = true;

  return list;
};

// match expressions have their own local dialect
// i.e. local syntax such as "::" and local keywords
// e.g. "case" and "default"
exports['match'].dialect = "match/matchexpr";

exports['function'] = function(lexer) {

  var form;

  // Are we really a match function?
  if(on_match_function(lexer)) {
    // yes - enable our local dialect (the reader will pop it
    // when the end of our scope is reached).
    debug('enabling local "matchexpr" for use within match function');
    reader.use_dialect("match/matchexpr", lexer, {local: true});

    // invoke the normal "function" handler:
    form = reader.invoke_readfn_overridden_by('match', 'function', lexer);
  }
  else {
    // use the standard "function" handlers:
    form = reader.retry
  }

  return form;
};

// is the function we're looking at a "match function"?
// (as opposed to a normal function?)
function on_match_function(lexer) {
  var matchFunction = false;

  lexer.mark_rewind_point();
  // the function keyword
  lexer.skip_text('function');

  // an optional name
  if(lexer.on(/[a-zA-Z_$][0-9a-zA-Z_$\.]*/g)) {
    lexer.next_token(/[a-zA-Z_$][0-9a-zA-Z_$\.]*/g);
  }

  // now a match function is followed by a body (only),
  // not arguments then a body
  if(lexer.on('{') || lexer.on('(do')) {
    matchFunction = true;
  }

  lexer.rewind();

  return matchFunction;
}
