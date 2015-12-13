var sl = require('sugarlisp-core/sl-types'),
    reader = require('sugarlisp-core/reader'),
    utils = require('sugarlisp-core/utils'),
    debug = require('debug')('sugarlisp:match:syntax');

// match expressions have their own local dialect
// i.e. local syntax such as "::" and the local keywords "case" and "default"
// normally these are only active if you use a "match" statement or match function
function enable_match_expressions(source, options) {
  options = options || {};
  var matchexprdialect = reader.use_dialect("match/matchexpr", source, options);
  if(typeof options.filelevel !== 'undefined' && !options.filelevel) {
   source.local_dialect("match/matchexpr", options.rootform);
  }
}

// ITS WEIRD I PULLED THIS PARENFREE VERSION OF MATCH
// DOWN FROM lite - I HADNT GIVEN IT MUCH THOUGHT BUT
// WHY WAS "MATCH" IN lite INSTEAD OF MATCH? THE
// WAY ID STRUCTURED THINGS BEFORE MATCH WAS JUST
// STANDARD LISPY SYNTAX AND lite BROUGHT IN THE
// PARENFREE ASPECT. IN RETROSPECT WHAT WOULD BE
// IDEAL IS IF MATCH STUFF IS *ONLY* IN MATCH BUT
// STILL LEAVES THE OPTION TO USE PARENS OR NOT
// I DID ADD THE __PARENOPTIONAL FLAG THING IS
// THAT WORKING IS THAT ENOUGH?

// this is a paren free version of the "match" statement syntax
// (presumably for use with lite)
// note that they don't have to use the paren free syntax
exports['match'] = function(source) {

  // the list form for this match expression
  var list = sl.list();

  // match expressions have their own local dialect
  // i.e. local syntax such as "::" and local keywords
  // e.g. "case" and "default"
  enable_match_expressions(source, {
    rootform: list,
    filelevel: false,
    merge: true
  });

  var matchToken = source.next_token('match');
  var matchAgainstList = reader.read(source);
  if(!(Array.isArray(matchAgainstList))) {
    source.error("the expression to match must be surrounded by parentheses");
  }
  // the parens are just syntax sugar - reach inside:
  var matchAgainst = matchAgainstList[0];

  list.push(sl.atom("match", {token: matchToken}));
  list.push(matchAgainst);

  // the match cases are expected to be a single form surrounded by {}
  list.push(reader.read(source));

  list.__parenoptional = true;

  return list;
};

exports['function'] = function(source) {
  if(on_match_function(source)) {
    debug("enabling match expression dialect (globally - need to revisit)");
    // RIGHT NOW IM ENABLING GLOBALLY JUST TO SEE IT WORK
    enable_match_expressions(source);

// SHOULDNT I BE ABLE HERE TO READ THE FUNCTION MYSELF BY
// CALLING READER.READ, THEN SET THE DIALECT ON *THAT* FORM
// JUST LIKE MATCH DOES ABOVE?
// THE PROBLEM RIGHT NOW IS IF I CALL READER.READ I'M STARTING
// AN INFINITE LOOP OF READING!!!  THERE'S NO WAY FOR ME
// TO SAY "READ USING THE DIALECTS BENEATH/OTHER THAN *ME*"
// COULD I DO SOMETHING WHERE I PASS BACK A CALLBACK AND HAVE
// THE READER TRULY CONTINUE BUT CALL *ME* BACK WHEN IT'S DONE
// READING?  OR COULD I ADD SOME TYPE OF AOP IDEA TO THE
// READTABLE AND BE ABLE TO INSERT BEFORE/AFTER FUNCTIONS
// TO BE CALLED BEFORE/AFTER A CERTAIN FORM HAS BEEN PARSED?
// ON A SIMPLER IDEA - I'M A LITTLE UNCLEAR COULDN'T/SHOULDNT
// THIS READ FUNCTION BE ABLE TO *JUST* READ "FUNCTION" AS A
// SYMBOL BY ITSELF NOT AN EXPRESSION?  THEN IT WOULD
// MAKE SENSE TO SIMPLY SET THE DIALECT ON THE FORM FOR
// THE "FUNCTION" SYMBOL?  THE PROBLEM IS THAT breaks
// SUBSEQUENT CUSTOM READERS FOR "FUNCTION" SUCH AS
// SHROUD'S RIGHT?
// THE PROBLEM WITH AOP IDEA IS IT CANT GET CALLED AFTER
// THE FUNCTION HAS BEEN READ BECAUSE GETTING THIS DIALECT
// IN PLACE IS IMPORTANT TO HOW THE INNARDS OF THE FUNCTION
// MAY BE READ!!  e.g. THE :: TYPE STUFF!!
// ONE DIRTY SOLUTION WOULD HAVE BEEN TO HAVE GIVEN UP ON
// IT BEING JUST "FUNCTION" AND HAVING MADE IT "MATCHFUNC"
// OR SOMETHING ELSE.  THAT SEEMS LIKE GIVING UP THOUGH.

  }

  // *all* we do here is enable the matchexpr dialact -
  // let the normal function parsing proceed...
  return reader.retry_match;
};

function on_match_function(source) {
  var matchFunction = false;

  source.mark_rewind_point();
  // the function keyword
  source.skip_text('function');

  // an optional name
  if(source.on(/[a-zA-Z_$][0-9a-zA-Z_$\.]*/g)) {
    source.next_token(/[a-zA-Z_$][0-9a-zA-Z_$\.]*/g);
  }

  // now a match function is followed by a body (only),
  // not arguments then a body
  if(source.on('{') || source.on('(do')) {
    matchFunction = true;
  }

  source.rewind();

  return matchFunction;
}
