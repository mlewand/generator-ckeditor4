
# foo

CKEditor 4 plugin. Foo

## Previewing

Just open your `samples/index.html` file.

## Installation

If your plugin is not yet published in [Add-ons repository](http://ckeditor.com/addons/plugins/all), follow [Manual Installation](http://docs.ckeditor.com/#!/guide/dev_plugins-section-manual-installation) guide.

## Testing

CKEditor 4 plugins are tested using Bender.js platform.

This plugin has also a basic testing infrastructure set up. All you need is:

```bash
npm install
npm test
```

For more information on how to test CKEditor, see [CKEditor Testing Environment](http://docs.ckeditor.com/#!/guide/dev_tests) guide.

### Bender Dashboard

You can also test in the browser, using Bender dashboard.

```bash
npm install
npm run test-server
```

This will run a [Bender.js](https://github.com/benderjs/benderjs) instance, listening at [localhost:1030](http://localhost:1030/).

## Add-ons Repository

You can submit your plugin just by visiting the [Add-ons Repository](http://ckeditor.com/addons/plugins/all) and following "Submit Plugin" link.