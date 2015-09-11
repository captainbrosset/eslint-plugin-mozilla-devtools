/**
 * @fileoverview A collection of rules that help enforce JavaScript coding
 * standard and avoid common errors in the Mozilla project.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

module.exports = {
  rules: {
    "components-imports": require("../lib/rules/components-imports"),
    "onlylazygetters": require("../lib/rules/onlylazygetters"),
    "import-headjs-globals": require("../lib/rules/import-headjs-globals"),
    "mark-test-function-used": require("../lib/rules/mark-test-function-used")
  },
  // [CODE REVIEW] as said on bugzilla, I believe we should remove these defaults.
  rulesConfig: {
    "components-imports": 1,
    "onlylazygetters": 1,
    "import-headjs-globals": 1,
    "mark-test-function-used": 1
  }
  // [CODE REVIEW] also, some of these rules never output errors (e.g. components-imports).
  // They're just special kinds of rules that read code and register globals.
  // Do we still need to pick a level (0/1/2) for these?
  // Also doesn't ESLint expose another way to execute this? Without having to make a rule for it?
  // If not, I believe it would be nice to file an issue on the ESLint repo. This is a valid use case.
};
