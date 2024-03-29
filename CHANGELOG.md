# Unreleased

- bump dependencies, fix typescript errors
- feat: show sidebar contents with overflow so that you can see if things are run multiple times with the same name
- feat: migrates to ember-template-imports for easier feature additions and changes

# 0.5.0 (12/08/2020)

- major bumps for all dependencies
- ensures that error modal scrolls to the line that currently has the error

# 0.4.1 (08/03/2020)

- fixes an issue where the progress bar never goes away after successful build
- fixes bug in table rendering which didn't allow data to update after changed

# 0.4.0 (07/31/2020)

- ensures that even when builds fail they are still viewable. This change makes buildState fields nullable.

# 0.3.0 (06/15/2020)

- ensures that if user serves ember application with `ember serve --path=dist`

# 0.2.5 (06/03/2020)

- instantiationStack component is now 400px instead of 700px and also the sidebar with the stack itself is scrollable instead of growing to whatever size the list needs.
- All condensable lists now extend CondensableComponent which will only provide the required amount of items to help with list rendering performance
- Remove attributes from graphql queries we aren't using
- add tooltip on plugin list to ensure plugins are readable

# 0.2.4 (06/01/2020)

- Search results are more consolidated
- Search results empty state looks as expected
- Fixes issue with table where sorting values are not picked correctly
- Ensure that plugin types that are formed like (broccoli-persistent-filter:Babel > [Babel: broccoli-inspector]) group by the first string matching (broccoli-persistent-filter:Babel)
- Fixes bug where plugins that were grouped could not be uncollapsed
- Catches graphql errors on build page and display modal
- Adds banner updates that specifies that ember-cli versions < 3.11.0 are not supported.

# 0.2.3 (05/27/2020)

- Adds the ability to download data from builds
- Scroll the file to the line number selected from stackTrace
- Adds modal banner to show when broccoli-inspector does not support the project it is being included in

# 0.2.2 (05/21/2020)

- Updated logo design thanks to Denis Toledo https://www.denistoledo.dev/

# 0.2.1 (05/19/2020)

- updates table styling to have more distinguished borders

# 0.2.0 (05/18/2020)

- major design overhaul
- adds error modal for when the broccoli funnel fails to build properly (#16)
- fixes places where ms wasn't sorting correctly

# 0.1.2 (05/11/2020)

- Surfaces monitors in the heimdall custom tab section as well
- Updates readme to contain information on how to access the ui.

# 0.1.1 (05/07/2020)

- instantiationStack viewer is now inline
- broccoli logo is used as favicon and navbar icon
- input and output node wrappers are now next to each-other
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
- consolidates navbar to have `|input| |links|`
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
