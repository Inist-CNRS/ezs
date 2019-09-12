# Contributing

## Use Pull Request

To propose an improvement/bug fix/documentation, create a Pull Request.

## Use conventional commits

Because we want to be able to generate CHANGELOGs automatically, use
[Conventional Commits](https://www.conventionalcommits.org).

The scope to use is simply the name of the package directory (`core`, `cli`,
`basics`, ...) or `root`.

There are tools to ease conventional commits:

- [VSCode Commitizen](https://github.com/KnisterPeter/vscode-commitizen)
- [Commitizen cli](http://commitizen.github.io/cz-cli/)
- [Cheat Sheet](https://www.cheatography.com/albelop/cheat-sheets/conventional-commits/)
- ...

### Commit examples

#### Fixing a bug

If you just fixed a bug in `packages/core`, you can use:

```bash
git commit -m "fix (core): Chuck Norris got it!"
```

where the optional `(core)` part says that the fix concerns the core package.

> **Note**: in this case, the lerna version will increase the patch version.

#### Add a feature

If you just added a feature in `packages/foo`:

```bash
git commit -m "feat (foo): Add marvelous new feature bar"
```

> **Note**: that will imply that
> `npx lerna version --exact --conventional-commits` will increase at least
> the minor version of the package.

#### Breaking change

If you introduced a breaking change in `packages/bar`:

```bash
git commit -m 'fix (bar): Fixed issue #4

BREAKING_CHANGE: baz function has changed parameters
'
```

## Create tests

Use [jest](https://jestjs.io) to create tests.

Put your tests files into a package's `__tests__`, or `test` directory.

Then, you can run all tests via

```bash
npm test
```

## Use lerna

Use [lerna](https://lerna.js.org/) to
[create](https://github.com/lerna/lerna/tree/master/commands/create) a new
package, [add](https://github.com/lerna/lerna/tree/master/commands/add) a
dependency to a new package.

Each time you use a package-specific lerna command, don't forget to precise
which package is targeted, with the `--scope=@ezs/package` option.

## Install

To install the dependencies of the packages, use
[bootstrap](https://github.com/lerna/lerna/tree/master/commands/bootstrap).

```bash
npx lerna bootstrap
```

## Transpiling

If you use [babel](https://babeljs.io) to transpile your code, use

```bash
npx lerna run build
```

## Publishing

Only if you have the rights (to GitHub for the first line, to npm
[`@ezs`](https://www.npmjs.com/org/ezs) organization for the second line).

```bash
npx lerna version --exact --conventional-commits
npx lerna publish from-package
```

## Use @ezs organization

When create a new package, name it with `@ezs/package` (where `package` is the package's name).

## Importing an existing package

### Clone the old package

Clone the git repository of the old package, and rename it as the new name
within the npm organization.

```bash
git clone https://github.com/touv/node-ezs ../old-ezs/core
```

### Import the package with lerna

```bash
npx lerna import ../old-ezs/core --flatten --preserve-commit
```

### Remove package-lock

Because it seems that `lerna bootstrap` does not remove old packages.

```bash
rm packages/core/package-lock.json
```

### Adapt the package.json

The `packages/core/package.json` has to be adapted:

- its `name`, from `ezs` to `@ezs/core`
- its `repository.url`, from `git+https://github.com/touv/node-ezs.git` to
  `git+https://github.com/Inist-CNRS/ezs.git`
- its `bugs.url`
- its `homepage`, from `https://github.com/touv/node-ezs#readme` to
  `https://github.com/Inist-CNRS/ezs/packages/core#readme`
- in `scripts`, keep only `lint`, `doc`, `build`, `prepublish`, `preversion`
- change `dependencies` version from `^a.b.c` to `~a.b.c`
- add a `publishConfig.access` and set it to `"public"`
- modify the `build` script if necessary: from `babel src --out-dir lib` to
  `babel --root-mode upward src --out-dir lib`
- replace, in `peerDependencies`, `"ezs": "^5.1.4"` with `"@ezs/core": "*"`

### Adapt README

Rename `ezs` to `@ezs/core`...

Add the badges (change `sparql` to the name of the package's directory):

```md
[![npm version](https://img.shields.io/npm/v/@ezs/sparql)](https://npm.im/@ezs/sparql)
[![license](https://img.shields.io/npm/l/@ezs/sparql)](https://npm.im/@ezs/sparql)
```

### Hoist devDependencies

We want to use the same dev depencies for all packages, so we can hoist them to
the root of the lerna repository.

Don't hoist devDependencies like `@ezs/core` (but you shouldn't depend on `@ezs`
package, see [Use the src files in tests](#use-the-src-files-in-tests)).

### Install package dependencies

To install the dependencies of the packages, use
[bootstrap](https://github.com/lerna/lerna/tree/master/commands/bootstrap).

```bash
npx lerna bootstrap
```

### Use the src files in tests

To have right test coverage numbers, use `require('../src')` instead of
`require('../lib')`, and

```js
const ezs = require('../../core/src');
```

instead of

```js
const ezs = require('@ezs/core');
```

If you don't, transpiled files are used (`lib`), and they are ignored by jest
coverage.

### Use jest for tests

If you come from mocha, you have to change the `it(...).timeout(10000)`s to
`it(..., 10000)`.

Also, consider that tests are launched from the repository's root, not from the
packages' root.

### Lint the JavaScript files

To lint a single package (say `@ezs/analytics`), use:

```bash
npx lerna run lint --scope=@ezs/analytics
```

### List the new package

Add the new package in the list of the [root's README](./README.md).
