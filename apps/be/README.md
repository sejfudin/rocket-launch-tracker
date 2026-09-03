# Orion API

## Template initialization

This template is scaffolded using [@povio/scaffold](https://github.com/povio/scaffold). Modules are self contained and
include the necessary setup scripts and instructions.

1. Remove all unneeded modules and components.

2. Start a new root branch

```bash
git checkout -b main
git reset $(git commit-tree HEAD^{tree} -m "@poviolabs/nestjs-template@$(git rev-parse HEAD)" -m "Co-authored-by: Povio <info@povio.com>")
```

3. Scaffold

```
yarn
yarn scaffold apply
```

3. Remove this readme section.

## Documentation

- [Architecture](./docs/codebase/02_Architecture.md)
- [Configuration](./docs/codebase/04_Config.md)
- [Observability](./docs/codebase/05_Observability.md)
- [REST API](./docs/codebase/06_REST.md)
- [Authentication](./src/common/authn/README.md)
- [Media Providers](./src/common/media/README.md)
- [Push Notifications](./src/common/push-notifications/README.md)
- [Email Providers](src/common/email//README.md)

## Local development

### Packages

```bash
# Use the version of Node.js specified in the .nvmrc file
nvm use
```

### Setup project

> `yarn setup`

```bash
# Install project packages
yarn

# Prepare local config template
yarn bootstrap

# Startup containers with required services
docker compose up -d
```

### Setup database

> [Prisma Migration Overview](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview)

```bash
# Build the Prisma client
yarn prisma generate

# Run migrations and build the Prisma client locally
yarn prisma migrate dev
```

### Build and Start

```bash
yarn build

# Start the application in watch mode for development
yarn start:dev
```

## Testing

```bash
# Test driven development
yarn test:watch
yarn yarn vitest -w --coverage

# Run only unit tests
yarn test:unit

# Run only e2e tests
#  requires related external services to be running
yarn test:e2e
```

## Contributing

```bash
# Lint and fix the project files
yarn lint:fix

# Commit changes using semantic commit messages
git commit -m "feat: my new feature"
```

## Documentation

```bash
# Generate Project Documentation
yarn docs
```
