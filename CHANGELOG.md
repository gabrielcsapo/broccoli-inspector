# 0.1.1 (05/07/2020)

- instantiationStack viewer is now inline
- broccoli logo is used as favicon and navbar icon
- input and output node wrappers are now next to eachother
- all table bodies can now be collapsed

# 0.1.0 (05/06/2020)

- system info information looks like `| key | value |`
- shows versions from process.versions on dashboard
- add line numbers to instantiationStack on node-info page
- change `Custom Heimdall Information` to `Heimdall Schemas`
- `Heimdall Schemas` are now formatted in a tab view
- Instance stack is now clickable and will show the user the file contents in a modal
- Sorts numbers correctly by allowing the inclusion of raw values to be used in sorting
- Shows outputNodeWrappers on node-info page

# 0.0.9 (05/05/2020)

- show custom heimdall stats object
- adds empty state for search results coming back empty
- shows the ellipses for search results stringValue so that the user knows there is more data behind and should click into the plugin to see more
- Updates readme to explain how broccoli inspector works
- tables will condense values and allow the user to expand if wanted
- tables sort strings and number values correctly
- adds system info information to the dashboard
- major design overhaul

# 0.0.8 (04/30/2020)

- only sends down the string diff that is needed instead of the entire file. Reduces network download size by more than half.

# 0.0.7 (04/30/2020)

- adds loading states for sidebar to only show up when data has loaded
- condense sidebar to only show 10 items initially
- while building crawl input and output paths to get the files on the node. This is going to make searching way faster on any project. Just searching on this project went from 6s to 8ms.

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
