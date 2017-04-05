/* @bender-include: /apps/plugin/plugin.js */
/* @bender-ckeditor-plugins: foo */

bender.editor = true;

bender.test( {
	'plugin is loaded': function() {
		assert.isTrue( 'foo' in this.editor.plugins, 'Plugin is loaded' );
	}
} );