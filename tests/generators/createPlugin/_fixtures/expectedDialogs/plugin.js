( function() {
	'use strict';

	CKEDITOR.plugins.add( 'my-plugin', {
		"requires": "dialog",
		init: function( editor ) {
			console.log( 'my-plugin plugin is loaded!' );
			CKEDITOR.dialog.add( 'my-plugin', this.path + 'dialogs/my-plugin.js' );
			editor.addCommand( 'my-plugin', new CKEDITOR.dialogCommand( 'my-plugin' ) );
		}
	} );
} )();