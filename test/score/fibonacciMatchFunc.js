var sl = require('sugarlisp-core/sl-types');
var match = require('sugarlisp-match/pattern-match');

function fib() {
  var args = Array.prototype.slice.call(arguments);
  return match(args, function(when) {
    (when([
        0
      ],
      function(vars) {
        return 0;
      }, this);)(when([
        1
      ],
      function(vars) {
        return 1;
      }, this);)(when([
        match.var("x", match.any)
      ],
      function(vars) {
        return (function(x) {
          return (fib((x - 1)) + fib((x - 2)));
        }).call(this, vars["x"]);
      }, this);)
  }, this)
}

console.log(fib(8));