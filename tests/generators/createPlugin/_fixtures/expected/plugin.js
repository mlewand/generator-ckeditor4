( function() {
	'use strict';

	CKEDITOR.plugins.add( 'foo', {
		lang: 'en',
		icons: 'foo',
		hidpi: true,
		init: function( editor ) {
			console.log( 'foo plugin is loaded!' );
		}
	} );
} )();