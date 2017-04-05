/* @bender-include: /apps/plugin/plugin.js */
/* @bender-ckeditor-plugins: <%= shortName %> */

bender.editor = true;

bender.test( {
	'plugin is loaded': function() {
		assert.isTrue( '<%= shortName %>' in this.editor.plugins, 'Plugin is loaded' );
	}
} );