( function() {
	'use strict';

	CKEDITOR.plugins.add( 'foobar', {
		"lang": "en",
		init: function( editor ) {
			console.log( 'foobar plugin is loaded!' );
		}
	} );
} )();