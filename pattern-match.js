
/**
* This is an (only) slightly extended version of Dave Herman's
* pattern-match module.
*
*    https://github.com/dherman/pattern-match
*
* The match dialect provides some syntax sugar on top of the library e.g.
* the "match type" syntax i.e. "var::type", used for function argument
* pattern matching as well as the more explicit "match" statement which
* follows the pattern-match library's api more closely.
*
* Though no code was used, additional inspiration for these features
* comes from Nate Faubion's very nice "sparkler" library for sweet.js:
*
*   https://github.com/natefaubion/sparkler
*
* The "extensions" to pattern-match here are simply defining predicates
* for matching sugarlisp's s-expression types: lists, atoms, symbols, etc.
* Doing so is allowed for in the pattern-match library (you can easily
* do the same to add predicates for your own types if you like):
*
*    https://github.com/dherman/pattern-match#custom-patterns
*
* Note when using these features to match lispy forms for generating code,
* be sure to use the "sl" versions i.e. match.slstring not match.string,
* match.slnumber not match.number.  The ones with "sl" may be useful in
* other code, just not when matching forms generated by the sugarlisp
* reader.
*
* Note that currently the code generated by sugarlisp simply assumes this
* module has been required and assigned to "match" and will give a
* run-time error if the pattern matching features are used without
* doing so.  Make sure that you require this extended version of the
* library as follows (note the "sugarlisp-match/" gets you this
* version not Dave Herman's original):
*
*    var match = require('sugarlisp-match/pattern-match');
*
*/

var match = require('pattern-match');
var sl = require('sugarlisp-core/types');

match.sllist = Array.isArray;

match.slatom = function(form) {
  return sl.isAtom(form);
};

match.slsymbol = function(form) {
  return sl.typeOf(form) === 'symbol';
};

match.slstring = function(form) {
  return sl.typeOf(form) === 'string';
};

match.slnumber = function(form) {
  return sl.typeOf(form) === 'number';
};

match.slboolean = function(form) {
  return sl.typeOf(form) === 'boolean';
};

match.slnull = function(form) {
  return sl.typeOf(form) === 'null';
};

// sldefault is available as an alternative to match.any
// it really just makes the lispy form look closer to the
// match statement's "default" keyword
match.sldefault = match.any;

// rest is mainly behind the scenes e.g. when you do ...rest
match.slrest = match.any;

module.exports = match;
