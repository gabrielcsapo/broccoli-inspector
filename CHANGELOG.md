# 0.0.6 (04/29/2020)

- fix label formatting for total fs timing data to turn us to ms.
- move group by plugin to sidebar from Navbar
- consolidates navbar to have `|input|     |links|`
- show node breakdown by fs and other (other being the time spent in the plugin that we don't have instrumentation to pin down where it is being spent.)
- Move search box for plugins into the right rail, this is specifically for search by plugin name
  - This functionality is done locally
- adds a link to table that will download the data as a csv
- be able to sort column values in tables
- adds a new search page that allows the searching of multiple fields such as derived fields like inputFiles and outputFiles

# 0.0.5 (04/28/2020)

- ui cleanup
- shows the selected plugin in the list when selected
- sort plugins by type by time
- shows the total time of nodesByType
- adds dashboard route to be able to show high level information

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