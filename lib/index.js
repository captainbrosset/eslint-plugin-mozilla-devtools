/**
 * @fileoverview A collection of rules that help the Mozilla Developer Tools
 * team to enforce coding standards and avoid common errors.
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
  rulesConfig: {
    "components-imports": 1,
    "onlylazygetters": 1,
    "import-headjs-globals": 1,
    "mark-test-function-used": 1
  }
};
