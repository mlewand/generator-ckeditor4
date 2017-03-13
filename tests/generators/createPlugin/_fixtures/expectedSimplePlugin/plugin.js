( function() {
	'use strict';

	CKEDITOR.plugins.add( 'my-plugin', {
		init: function( editor ) {
			console.log( 'my-plugin plugin is loaded!' );
		}
	} );
} )();