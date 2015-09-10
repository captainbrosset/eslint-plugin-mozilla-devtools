/**
 * @fileoverview Detects places where lazy getters should have been used but
 * weren't.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {
  // variables should be defined here

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------

  // Cu.import is deprecated. Please use loader.lazyImporter(this, "ViewHelpers",
  // "resource:///modules/devtools/ViewHelpers.jsm")
  function cuImportMatched(name, path, context, node) {
    context.report(node, "Cu.import is deprecated. Please use " +
                         "loader.lazyImporter(this, \"" +
                          name + "\", \"" + path + "\")");
  }

  // require is deprecated. Please use loader.lazyRequireGetter(this,
  // "EventEmitter", "devtools/toolkit/event-emitter")
  function requireMatched(name, path, context, node) {
    context.report(node, "require is deprecated. Please use " +
                         "loader.lazyRequireGetter(this, " +
                         "\"" + name + "\", \"" + path + "\")");
  }

  // Cc[...].getService() is deprecated. Please use loader.lazyServiceGetter(this,
  // "clipboardHelper", "@mozilla.org/widget/clipboardhelper;1",
  // "nsIClipboardHelper")
  function getServiceMatched(name, identifier, className, context, node) {
    context.report(node, "Cc[...].getService() is deprecated. Please use " +
                         "loader.lazyServiceGetter(this, \"" + name + "\"" +
                         ", \"" + identifier + "\", \"" + className + "\")");
  }

  // XPCOMUtils.defineLazyGetter(this, "_strings", ...) is deprecated. Please use
  // loader.lazyGetter(this, "_strings", () => { return ...; });
  function lazyGetterMatched(scope, name, context, node) {
    context.report(node, "XPCOMUtils.defineLazyGetter(" + scope + ", \"" + name +
                         "\", ...) is deprecated. Please use loader.lazyGetter(" +
                         scope + ", \"" + name + "\", () => { return ...; });");
  }

  // XPCOMUtils.defineLazyModuleGetter(this, "setNamedTimeout", ...) is
  // deprecated. Please use:
  // loader.lazyGetter(this, "_strings", () => { return ...; });
  function lazyModuleGetterMatched(scope, name, path, context, node) {
    context.report(node, "XPCOMUtils.defineLazyModuleGetter(" + scope + ", \"" + name +
                         "\", ...) is deprecated. Please use loader.lazyImporter(" +
                         scope + ", \"" + name + "\", \"" + path + "\"");
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
      var matches = source.match(/^(?:Cu|Components\.utils)\.import\("(.*\/(.*?)\.jsm?)"\);?$/);
      if (matches) {
        var name = matches[2];
        var path = matches[1];

        cuImportMatched(name, path, context, node);
        return;
      }

      // require("devtools/toolkit/event-emitter");
      matches = source.match(/require\("(.+?)"\);?$/);
      if (matches) {
        path = matches[1];

        requireMatched("myVar", path, context, node);
        return;
      }

      // XPCOMUtils.defineLazyGetter(this, "_strings", ...)
      matches = source.match(/^XPCOMUtils\.defineLazyGetter\((\w+),\s\"(\w+)\"/);
      if (matches) {
        var scope = matches[1];
        name = matches[2];

        lazyGetterMatched(scope, name, context, node);
        return;
      }

      // XPCOMUtils.defineLazyModuleGetter(this, "setNamedTimeout", ...)
      matches = source.match(/^XPCOMUtils\.defineLazyModuleGetter\((\w+), "(\w+)",\s\"([\w\:\/]+\.jsm?)\"\);?$/);
      if (matches) {
        var scope = matches[1];
        name = matches[2];
        path = matches[3];

        lazyModuleGetterMatched(scope, name, path, context, node);
        return;
      }
    },

    VariableDeclaration: function(node) {
      var source = getSource(node, context);

      // let blah = Cu.import("resource:///modules/devtools/ViewHelpers.jsm");
      var matches = source.match(/(\w+)\s=\s(?:Cu|Components\.utils)\.import\("(.*\/(.*?)\.jsm?)"\);?$/);
      if (matches) {
        var name = matches[1];
        var path = matches[2];

        cuImportMatched(name, path, context, node);
        return;
      }

      // let clipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"]
      //                         .getService(Ci.nsIClipboardHelper);
      matches = source.match(/(\w+)\s=\s(?:Cc|Components\.classes)\[\"(.*?)\"\]\.getService\((?:Ci|Components\.interfaces)\.(\w+)\);?$/);
      if (matches) {
        name = matches[1];
        var identifier = matches[2];
        var className = matches[3];

        getServiceMatched(name, identifier, className, context, node);
        return;
      }

      // const EventEmitter = require("devtools/toolkit/event-emitter");
      matches = source.match(/(\w+)\s=\srequire\("(.+?)"\);?$/);
      if (matches) {
        name = matches[1];
        path = matches[2];

        requireMatched(name, path, context, node);
        return;
      }
    }
  };
};
