/**
 * @fileoverview Adds the filename of imported files e.g.
 * Cu.import("some/path/Blah.jsm") adds Blah to the current scope.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var path = require("path");
var escope = require("eslint/node_modules/escope");

module.exports = function(context) {
  // variables should be defined here

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------

  function addVarToScope(name, context) {
    console.log("XXXXX Adding " + name + " to scope");
    var scope = context.getScope();
    var variables = scope.variables;
    var variable = new escope.Variable(name, scope);

    variable.eslintExplicitGlobal = false;
    variable.writeable = true;
    variables.push(variable);
  }

  function getSource(node, context) {
    return context.getSource(node).replace(/[\r\n]+\s*/g, " ")
                                  .replace(/\s*=\s*/g, " = ")
                                  .replace(/\s+\./g, ".")
                                  .replace(/,\s+/g, ", ")
                                  .replace(/;\n(\d+)/g, ";$1")
                                  .replace(/\s+/g, " ");
  }

  //--------------------------------------------------------------------------
  // Public
  //--------------------------------------------------------------------------

  return {
    ExpressionStatement: function(node) {
      var source = getSource(node, context);

      // Cu.import("resource:///modules/devtools/ViewHelpers.jsm");
      var matches = source.match(/^(?:Cu|Components\.utils)\.import\(".*\/(.*?)\.jsm?"\);?$/);
      if (matches) {
        var name = matches[1];

        addVarToScope(name, context);
        return;
      }

      // loader.lazyImporter(this, "name1");
      matches = source.match(/^loader\.lazyImporter\(\w+, "(\w+)"/);
      if (matches) {
        name = matches[1];

        addVarToScope(name, context);
        return;
      }

      // loader.lazyRequireGetter(this, "name2"
      matches = source.match(/^loader\.lazyRequireGetter\(\w+, "(\w+)"/);
      if (matches) {
        name = matches[1];

        addVarToScope(name, context);
        return;
      }

      // loader.lazyServiceGetter(this, "name3"
      matches = source.match(/^loader\.lazyServiceGetter\(\w+, "(\w+)"/);
      if (matches) {
        name = matches[1];

        addVarToScope(name, context);
        return;
      }

      // XPCOMUtils.defineLazyModuleGetter(this, "setNamedTimeout", ...)
      matches = source.match(/^XPCOMUtils\.defineLazyModuleGetter\(\w+, "(\w+)"/);
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
        return;
      }

      // XPCOMUtils.defineLazyGetter(this, "clipboardHelper"
      matches = source.match(/^XPCOMUtils\.defineLazyGetter\(\w+, "(\w+)"/);
      if (matches) {
        name = matches[1];

        addVarToScope(name, context);
        return;
      }
    }
  };
};
