( function() {
	'use strict';

	CKEDITOR.plugins.add( 'foobar', {
		"icons": "foobar",
		"hidpi": true,
		init: function( editor ) {
			console.log( 'foobar plugin is loaded!' );
		}
	} );
} )();