// Generated by SugarLisp v0.5
var sl = require('sugarlisp-core/types');
var match = require('sugarlisp-match/pattern-match');
var reader = require('sugarlisp-core/reader');

function testMatch(forms) {
  return match(forms, function(when) {
    when([
        function(sym) {
          return sym.value === "function";
        },
        match.var("fname", match.slsymbol),
        match.var("fargs", match.any)
      ],
      function(vars) {
        return (function(fname, fargs, fbody) {
          console.log(["Was: function ", fname, "(", fargs, ") (", fbody, ")"].join(''));
        }).call(this, vars["fname"], vars["fargs"], vars["_rest"]);
      }, this);
    when([
        function(sym) {
          return sym.value === "function";
        },
        match.var("fargs", match.any)
      ],
      function(vars) {
        return (function(fargs, fbody) {
          return (function() {
            console.log(["Was: Anonymous function (", fargs, ") (", fbody, ")"].join(''));
          })();
        }).call(this, vars["fargs"], vars["_rest"]);
      }, this);
    when([
        match.var("any", match.sldefault)
      ],
      function(vars) {
        return (function(any) {
          console.log(["No match ", any].join(''));
        }).call(this, vars["any"]);
      }, this);
  }, this);
}

var src = '(function add(x y) (+ x y))';
var forms = reader.read_from_source(src, 'testReader.slisp');
console.log(["\n ", sl.pprintSEXP(forms[0].toJSON(), {
  bareSymbols: true
}), "\n"].join(''));
testMatch(forms[0]);
src = '(function (x y) (+ x y))';
forms = reader.read_from_source(src, 'testReader.slisp');
console.log(["\n ", sl.pprintSEXP(forms[0].toJSON(), {
  bareSymbols: true
}), "\n"].join(''));
testMatch(forms[0]);