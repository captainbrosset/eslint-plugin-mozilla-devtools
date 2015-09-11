/**
 * @fileoverview Import globals from head.js and from any files that were
 * imported by head.js (as far as we can correctly resolve the path).
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var fs = require("fs");
var path = require("path");
var escope = require("eslint/node_modules/escope");
var espree = require("eslint/node_modules/espree");

module.exports = function(context) {
  // variables should be defined here

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------

  function addVarToScope(name, context) {
    var scope = context.getScope();
    var variables = scope.variables;
    var variable = new escope.Variable(name, scope);

    variable.eslintExplicitGlobal = false;
    variable.writeable = true;
    variables.push(variable);
  }

  function checkFile(fileArray, context) {
    var filePath = fileArray.pop();

    while (filePath) {
      var headText;

      try {
        headText = fs.readFileSync(filePath, "utf8");
        // [CODE REVIEW] I'm going to assume that using the sync version of this
        // function is fine because there's no concurrency involved here, the
        // rules just run to completion in a sequence.
      } catch(e) {
        // Couldn't find file, continue.
        filePath = fileArray.pop();
        continue;
      }

      // Use a permissive config file to allow parsing of anything that Espree
      // can parse.
      var config = {
        range: true,
        loc: true,
        tolerant: true,
        ecmaFeatures: {
          arrowFunctions: true,
          blockBindings: true,
          destructuring: true,
          regexYFlag: true,
          regexUFlag: true,
          templateStrings: true,
          binaryLiterals: true,
          octalLiterals: true,
          unicodeCodePointEscapes: true,
          defaultParams: true,
          restParams: true,
          forOf: true,
          objectLiteralComputedProperties: true,
          objectLiteralShorthandMethods: true,
          objectLiteralShorthandProperties: true,
          objectLiteralDuplicateProperties: true,
          generators: true,
          spread: true,
          superInFunctions: true,
          classes: true,
          modules: true,
          globalReturn: true
        }
      };
      var ast = espree.parse(headText, config);
      var scopeManager = escope.analyze(ast);
      var globalScope = scopeManager.acquire(ast);

      for (var variable in globalScope.variables) {
        var name = globalScope.variables[variable].name;
        addVarToScope(name, context);
      }

      for (var index in ast.body) {
        var node = ast.body[index];
        var source = getTextForNode(node, headText);

        // [CODE REVIEW]: below, you're re-doing what component-imports.js does
        // already. I understand why you need to do it here too, but then you
        // could extract that part of the code into a helper module that both
        // rules would just require.

        // Cu.import("resource:///modules/devtools/ViewHelpers.jsm");
        var matches =
          source.match(/^(?:Cu|Components\.utils)\.import\(".*\/(.*?)\.jsm?"\);?$/);
        if (matches) {
          name = matches[1];

          addVarToScope(name, context);
          continue;
        }

        // loader.lazyImporter(this, "name1"
        matches = source.match(/^loader\.lazyImporter\(\w+, "(\w+)"/);
        if (matches) {
          name = matches[1];

          addVarToScope(name, context);
          continue;
        }

        // devtools.lazyRequireGetter(this, "name2"
        matches = source.match(/^devtools\.lazyRequireGetter\(\w+, "(\w+)"/);
        if (matches) {
          name = matches[1];

          addVarToScope(name, context);
          continue;
        }

        // loader.lazyServiceGetter(this, "name3"
        matches = source.match(/^loader\.lazyServiceGetter\(\w+, "(\w+)"$/);
        if (matches) {
          name = matches[1];

          addVarToScope(name, context);
          continue;
        }

        // XPCOMUtils.defineLazyModuleGetter(this, "setNamedTimeout", ...)
        matches =
          source.match(/^XPCOMUtils\.defineLazyModuleGetter\(\w+, "(\w+)"/);
        if (matches) {
          name = matches[1];

          addVarToScope(name, context);
          return;
        }

        // loader.lazyGetter(this, "toolboxStrings"
        matches = source.match(/^loader\.lazyGetter\(\w+, "(\w+)"/);
        if (matches) {
          name = matches[1];

          addVarToScope(name, context);
          continue;
        }

        // Scripts loaded using loadSubScript or loadHelperScript
        matches =
          source.match(/^(?:Services\.scriptloader\.|loader)?loadSubScript\((.+?)["'],?/);
        if (!matches) {
          matches = source.match(/^loadHelperScript\((.+?)["'],?/);
        }
        if (matches) {
          var cwd = process.cwd();
          filePath = matches[1];
          filePath = filePath.replace(/testdir\s*\+\s*["']\//gi, cwd + "/");
          filePath = filePath.replace(/testdir\s*\+\s*["']/gi, cwd);
          filePath = filePath.replace(/test_dir\s*\+\s*["']/gi, cwd);
          filePath = filePath.replace(/["']/gi, "");

          var fileName = path.basename(filePath);
          if (fileName === "shared-head.js") {
            // shared-head.js is a special case and we know the path so let's
            // access it directly.
            filePath = path.join("..", "..", "framework", "test", fileName);
          }

          fileArray.push(filePath);
        }
      }

      filePath = fileArray.pop();
    }
  }

  function getTextForNode(node, text) {
    var source = text.substr(node.range[0], node.range[1] - node.range[0]);

    return source.replace(/[\r\n]+\s*/g, "")
                 .replace(/\s*=\s*/g, " = ")
                 .replace(/\s+\./g, ".")
                 .replace(/,\s+/g, ", ")
                 .replace(/;\n(\d+)/g, ";$1");
  }

  //--------------------------------------------------------------------------
  // Public
  //--------------------------------------------------------------------------

  return {
    Program: function(node) {
      var pathAndFilename = this.getFilename();
      var processPath = process.cwd();
      // [CODE REVIEW]: This should be the default value of a config parameter
      // of this rule. So that users of this rule may configure a different
      // regex for test directories that don't name files this way.
      var isTest = /.*\/browser_.+\.js$/.test(pathAndFilename);

      if (!isTest) {
        return;
      }

      var testFilename = path.basename(pathAndFilename);
      var testPath = path.join(processPath, testFilename);
      // [CODE REVIEW]: I think head.js should be the default value of a config
      // parameter of this rule. We can't assume that it's always going to be
      // named this way, but it's a reasonable default.
      var headjs = path.join(processPath, "head.js");
      checkFile([testPath, headjs], context);
    }
  };
};
