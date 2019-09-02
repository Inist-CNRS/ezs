# Contributing

## Use Pull Request

To propose an improvement/bug fix/documentation, create a Pull Request.

## Use conventional commits

Because we want to be able to generate CHANGELOGs automatically, use 
[Conventional Commits](https://www.conventionalcommits.org).

## Create tests

Use [jest](https://jestjs.io) to create tests.

Put your tests files into a package's `__tests__` directory.

Then, you can run all tests via

```bash
npm test
```

## Use lerna

Use [lerna](https://lerna.js.org/) to [create](https://github.com/lerna/lerna/tree/master/commands/create) 
a new package, [add](https://github.com/lerna/lerna/tree/master/commands/add) a dependency to a new package.

## Transpiling

If you use [babel](https://babeljs.io) to transpile your code, use

```bash
npx lerna build
```

## Publishing

Only if you have the rights (to GitHub for the first line, to npm [`@ezs`](https://www.npmjs.com/org/ezs)
organization for the second line).

```bash
npx lerna version --exact --conventional-commits
npx lerna publish from-package
```

## Use @ezs organization

When create a new package, name it with `@ezs/package` (where `package` is the package's name).
