var sl = require('sugarlisp-core/sl-types'),
    utils = require('sugarlisp-core/utils');

exports["match"] = function(forms) {
    var js;

    if (forms.length !== 3) {
      forms.error("match expects something to match followed by a body containing match cases (wrapped in {} or lispy (do..))");
    }

    var matchAgainst = (Array.isArray(forms[1]) ? this.transpileExpression(forms[1]) : forms[1]);

    // match cases are placed in a "do" (or "begin") code block (i.e. {})
    var matchCases = forms[2];
    if(sl.typeOf(matchCases[0]) === 'symbol' &&
      (sl.valueOf(matchCases[0]) === "do" || sl.valueOf(matchCases[0]) === "begin")) {
      matchCases.shift();
    }

    js = sl.generated();
    js.push(["return match(", matchAgainst.toString(), ", function(when) {\n"]);

    this.indent += this.indentSize;
    var that = this;
    matchCases.forEach(function(matchCase) {
      js.push(that.transpileExpression(matchCase));
    });
    this.indent -= this.indentSize;

    js.push([" ".repeat(this.indent),"}, this)"]);

    return js;
}


// "match functions" can match their (otherwise undeclared) array of arguments.
// note: here we intentionally override "function" from core
exports["function"] = function(forms) {
    var js,fName;

    if (forms.length < 2) {
      forms.error("missing arguments:  function declarations require an argument list and function body");
    }

    // the forms includes "function" on the front of the expression:
    var astPos = 1 // so we start 1 not 0
    if(sl.typeOf(forms[astPos]) === 'symbol') {
      // a named function
      fName = forms[1]
      astPos++
    }

    // A match function has no args list it's *just* the body
    if((forms.length - astPos) !== 1) {
      // we don't handle this let a lower dialect take it:
      return undefined;
    }

    // it is a match function (or else it's malformed!)
    var matchBody = forms[astPos];
    var source = forms.sourcer;
    var matchExpr = sl.list("match", "args", forms[astPos]);

    // note: "function" or "function*" below depending on how we were invoked
    js = sl.generated()
    js.push(sl.valueOf(forms[0]) + (fName ? " " + sl.valueOf(fName) : "") + "() {\n")
    this.indent += this.indentSize;
    js.push([" ".repeat(this.indent), "var args = Array.prototype.slice.call(arguments);\n"]);
    js.push([" ".repeat(this.indent), this.transpileExpression(matchExpr)]);
    this.indent -= this.indentSize;
    js.push("\n}");

    if(fName)
      this.noSemiColon = true

    return js;
}
