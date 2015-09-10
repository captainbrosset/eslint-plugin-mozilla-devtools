# eslint-plugin-mozilla-devtools

A collection of rules that help the Mozilla Developer Tools team to enforce coding standards.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-mozilla-devtools`:

```
$ npm install eslint-plugin-mozilla-devtools --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-mozilla-devtools` globally.

## Usage

Add `mozilla-devtools` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "mozilla-devtools"
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
