# EZS Project AGENTS.md

## Project Overview

This repository contains a JavaScript monorepo for the **EZS** project, a tool
for processing data streams using a pipeline of instructions.  
The project is managed with Lerna and Yarn workspaces.

The core package, `@ezs/core`, provides a set of "native instructions" that
can be used to build complex data processing pipelines. These instructions
include functionalities for transforming, filtering, and routing data.  
The project is designed to be extensible, with additional packages providing
more specialized instructions.

## Building and Running

### Dependencies

Install dependencies using Yarn:

```bash
yarn install
```

### Building

Build all the packages:

```bash
yarn build
```

### Testing

Run the test suite:

```bash
yarn test
```

This will run all tests in the monorepo.  
To run tests for a specific package, you can use the `jest` command directly
within the package's directory.

### Running the CLI

The `@ezs/core` package provides a command-line interface (CLI) for executing
EZS scripts.

```bash
packages/core/bin/ezs <your-script.ini>
```

## Development Conventions

* **Monorepo:** The project is a monorepo, with individual packages located in the `packages/` directory.
* **Yarn Workspaces:** Yarn workspaces are used to manage dependencies across the monorepo.
* **Yarn Workspaces:** Yarn workspaces are used to manage dependencies across the monorepo.
* **Linting:** The project uses ESLint for code linting. You can run the linter with `yarn lint`.

### Committing

The project uses [Conventional Commits](https://www.conventionalcommits.org). This allows for automatic changelog generation.

When committing, the scope of the commit should be the name of the package directory (`core`, `cli`, `basics`, etc.) or `root`.

Example of a fix commit in `packages/core`:

```bash
git commit -m "fix(core): Fix a bug in the core package"
```

Example of a feature commit in `packages/foo`:

```bash
git commit -m "feat(foo): Add a new feature to the foo package"
```

### Lerna Workflows

[Lerna](https://lerna.js.org/) is used to manage the monorepo.

* **Creating a new package:** `npx lerna create @ezs/package`
* **Adding a dependency to a package:** `npx lerna add <dependency> --scope=@ezs/package`
* **Bootstrapping packages:** `npx lerna bootstrap`

### Publishing

To publish packages to npm, you must have the appropriate rights to the `@ezs` organization on npm.

The publishing process is as follows:

1. Ensure you are on the `master` branch.
2. Run `npm run release:version` to version the packages.
3. Run `npm run release:publish` to publish the packages to npm.

### Documentation

The `documentation.js` library is used to generate documentation from source code comments.

To generate the documentation, run:

```bash
npx yarn run doc
```
