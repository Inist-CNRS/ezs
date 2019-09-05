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
- ...

## Create tests

Use [jest](https://jestjs.io) to create tests.

Put your tests files into a package's `__tests__` directory.

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

### Adapt the package.json

The `packages/core/package.json` has to be adapted:

- its `name`, from `ezs` to `@ezs/core`
- its `repository.url`, from `git+https://github.com/touv/node-ezs.git` to `git+https://github.com/Inist-CNRS/ezs.git`
- its `bugs.url`
- its `homepage`, from `https://github.com/touv/node-ezs#readme` to `https://github.com/Inist-CNRS/ezs/packages/core#readme`
- add a `publishConfig.access` and set it to `"public"`

### Hoist devDependencies

We ant to use the same dev depencies for all packages, so we can hoist them to
the root of the lerna repository.

### Use jest for tests

If you come from mocha, you have to change the `it(...).timeout(10000)`s to
`it(..., 10000)`.

Also, consider that tests are launched from the repository's root, not from the
packages' root.

### List the new package

Add the new package in the list of the [root's README](./README.md).
