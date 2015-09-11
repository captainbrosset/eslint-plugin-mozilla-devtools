# eslint-plugin-mozilla

A collection of rules that help enforce JavaScript coding standard in the
Mozilla project.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-mozilla`:

```
$ npm install eslint-plugin-mozilla --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must
also install `eslint-plugin-mozilla` globally.

## Usage

Add `mozilla` to the plugins section of your `.eslintrc` configuration
file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "mozilla"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "components-imports": 1
    }
}
```

## Supported Rules

* components-imports
* onlylazygetters
* import-headjs-globals
* mark-test-function-used
[CODE REVIEW] rules are easy to create, and I suspect a lot of very specific rules will get created in time, so I don't think we need to list the rules here, but instead, we should have a rules doc directory with .md files (as I see you've done already).