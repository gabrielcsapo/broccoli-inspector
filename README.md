# broccoli-inspector

🔍 inspect what's really happening in your broccoli pipeline

> there be 🐲 here! The API's and functionality are still be cemented, anything before a 1.0.0 release will be subject to change.

## Installation

```
yarn add broccoli-inspector --dev
```

## Usage

> Currently the middleware is made to work with ember's built in server middleware functionality. The end goal for this project is that this will be built into broccoli directly and will be available out of the box when using broccoli in your projects.

If you are using this to profile and debug an Ember applications build, please add this to the following places.

```js
// server/index.js

module.exports = function (app, info) {
  require('broccoli-inspector/lib/middleware')(app, info);
};
```

To get FS timing information ensure that you add `EMBER_CLI_INSTRUMENTATION=1` running `ember serve`.

> Currently tracking moving this functionality into broccoli here https://github.com/broccolijs/broccoli/issues/461.
