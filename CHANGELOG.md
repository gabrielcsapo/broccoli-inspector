# 0.0.3 (04/23/2020)

- subclasses the apollo service and serves graphql requests over the same location as the application url. This means that consumers don't need to specify what url their application is being served over.

# 0.0.2 (04/23/2020)

- fix dependencies from being in devDependencies
- doesn't build on install, builds on prepublish

# 0.0.1 (04/22/2020)

- Basic functionality works
- Tied to ember-cli middleware functionality
- Leverages FS timing from `EMBER_CLI_INSTRUMENTATION=1`
