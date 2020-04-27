# 0.0.4 (04/26/2020)

- show total plugins in rollup list
- show total build time in progressbar when build is finished
- route name is `/_broccoli-inspector` instead of `/broccoli-inspector`
- group plugins by default
- show nodeInfo
- allows table to take tagName to render text in custom wrappers

# 0.0.3 (04/23/2020)

- subclasses the apollo service and serves graphql requests over the same location as the application url. This means that consumers don't need to specify what url their application is being served over.

# 0.0.2 (04/23/2020)

- fix dependencies from being in devDependencies
- doesn't build on install, builds on prepublish

# 0.0.1 (04/22/2020)

- Basic functionality works
- Tied to ember-cli middleware functionality
- Leverages FS timing from `EMBER_CLI_INSTRUMENTATION=1`
