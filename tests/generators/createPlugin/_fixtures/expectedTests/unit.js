/* @bender-ckeditor-plugins: my-plugin */

bender.editor = true;

bender.test( {
	'plugin is loaded': function() {
		assert.isTrue( 'my-plugin' in this.editor.plugins, 'Plugin is loaded' );
	}
} );