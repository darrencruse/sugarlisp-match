var sl = require('sugarlisp-core/types'),
    reader = require('sugarlisp-core/reader'),
    utils = require('sugarlisp-core/utils'),
    corekeywords = require('sugarlisp-core/keywords'),
    debug = require('debug')('sugarlisp:match:matchexpr-keywords:info'),
    trace = require('debug')('sugarlisp:match:matchexpr-keywords:trace');

exports["case"] = function(forms) {

    if (forms.length < 3) {
      forms.error("match \"case\" expects a match pattern followed by a code block");
    }

    var source = sl.sourceOf(forms);
    var pattern = forms[1];
    var templateBody = forms[2];
    var js = sl.transpiled();
    var argNames = [];

    js.push([" ".repeat(this.indent),"when("]);

    if(sl.isList(pattern)) {
      // get just the match var names from the pattern
      argNames = (pattern.map(function(patt) {
        var name;
        if(sl.typeOf(patt) === 'symbol' &&
          sl.valueOf(patt) !== 'array' && sl.valueOf(patt) != 'quasiquote') {
          name = sl.valueOf(patt);
        }
        else if(sl.isList(patt) && patt[0] && sl.valueOf(patt[0]) &&
          (sl.valueOf(patt[0]) === '::' || sl.valueOf(patt[0]) === 'match.var')) {
            name = sl.stripQuotes(sl.valueOf(patt[1]));
        }
        return name;
      })).filter(function(name) { return typeof name !== 'undefined'; });

      if(argNames.length > 0) {
        var lastVar = argNames[argNames.length-1];
        if(lastVar.indexOf('...') !== -1) {
          pattern.pop();  // pattern-match module *defaults* to setting _rest
        }
      }

      // transform simple match var patterns as if they'd entered "var::any"
      // note: extra care needed below since map creates a *new* array
      var originalParent = pattern.parent;
      pattern = pattern.map(function(patt) {
        var withMatchType = patt;
        var originalParent = patt.parent;
        if(sl.typeOf(patt) === 'symbol' &&
          sl.valueOf(patt) !== 'array' && sl.valueOf(patt) != 'quasiquote') {
          withMatchType = varMatchingAny(patt);
        }
        else if(sl.typeOf(patt) === 'string') {
          withMatchType = symbolMatching(patt);
        }
        if(!withMatchType.parent) {
          withMatchType.parent = originalParent;
        }
        return withMatchType;
      });
      pattern = Array.isArray(pattern) ? sl.listFromArray(pattern) :  pattern;
      pattern.parent = originalParent;
    }

    var patternSource = sl.isList(pattern) ? this.transpileExpression(pattern) : pattern;
    js.push(patternSource.toString());
    js.push([",\n"," ".repeat(this.indent),"function(vars) {\n"]);
    if(argNames.length > 0) {
      // now we wrap the body to destructure "vars" to the names they expect:
      var matchVarsToArgsFnForm = sl.list("function");
      var argNamesForms = argNames.map(function(name) {
        return sl.atom(name.indexOf('...') === -1 ? name : name.substring(3));
      });
      matchVarsToArgsFnForm.push(sl.listFromArray(argNamesForms));
      matchVarsToArgsFnForm.push(templateBody);
      // let the normal function code template translate this:
// SHOULDNT INDENT GO UP AND DOWN BY ONE AND OTHERWISE BE SCALED AUTOMATICALLY?
      this.indent += this.indentSize;
      var templateFn = corekeywords["function"].call(this, matchVarsToArgsFnForm);
      trace("templateFn is:", templateFn.toString());
      // next we invoke the function using run-time arguments
      // and making sure to pass through our "this" (otherwise
      // it's confusing since they don't see these functions in
      // the sugared syntax)
      js.push([' '.repeat(this.indent),'return (',
              templateFn,
            ').call(this, ',matchVarsToArgsFnCallArgsToJs(argNames),');\n']);
      this.indent -= this.indentSize;
    }
    else {
      // no match vars so no need to wrap the template body
      templateBody = sl.isList(templateBody) ? this.transpileExpression(templateBody) : templateBody;
      js.push([' '.repeat(this.indent + this.indentSize), "return ", sl.valueOf(templateBody), ";\n"]);
    }
    js.push([" ".repeat(this.indent), "}, this);\n"]);
    trace('matchCaseToJs returning:', js.toString());
    return js
}

// return forms for a var matching anything
function varMatchingAny(varnameAtom) {
  return sl.list(sl.atom("::", {token: varnameAtom}), varnameAtom, sl.str("any"));
}

// return forms for matching a symbol
// (to distinguish symbols from match var names they are quoted in the patterns)
function symbolMatching(symbolAtom) {
  return sl.list(sl.atom("::", {token: symbolAtom}), symbolAtom, "slsymbol");
}

exports["default"] = function(forms) {
  // "default" is just sugar for a normal case matching anything
  var defaultCaseForm = sl.list("case", defaultMatch(), forms[1]);
  defaultCaseForm.setParents(sl.parentOf(forms));
  return this.transpileExpression(defaultCaseForm);
}

// return forms for the default match
function defaultMatch() {
  var pattern = sl.list("match.var", "\"any\"", "match.sldefault");
  return sl.list("array", pattern);
}

function matchVarsToArgsFnCallArgsToJs(matchVarNames) {
  var js = "";
  matchVarNames.forEach(function(argName, i) {
    if(argName.indexOf('...') !== -1) {
      argName = "_rest";
    }
    js += "vars[\"" + argName + "\"]";
    if(i < (matchVarNames.length-1)) {
      js += ', '
    }
  });
  return js;
}

/**
* the :: match type expression
* note:  this has been transformed by the reader from infix to prefix
*/
exports["::"] = function(forms) {
    var js;
    trace(':: forms:', forms);
    if (forms.length < 3) {
      forms.error("missing arguments:  match type expressions should be of the form var::type");
    }

    if(sl.typeOf(forms[1]) === 'symbol') {
      var varname = sl.valueOf(forms[1]);
      var typename = sl.valueOf(forms[2]);
      if(varname.indexOf("...") !== -1 && typename !== 'slrest') {
        console.warn('var name "' + varname + '" with inappropriate match type of "' + typename + '"');
        typename = 'rest';
      }

      js = sl.transpiled();
      js.push([this.margin(), "match.var(\"",varname, "\", match.", typename, ")"]);
    }
    else if(sl.typeOf(forms[1]) === 'string') {
      var str = sl.valueOfStr(forms[1]);
      js = sl.transpiled();
      js.push(['function(sym) { return sym.value === "', str, '"; }']);
    }

    return js;
 }
