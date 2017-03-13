( function() {
	'use strict';

	CKEDITOR.plugins.add( '<%= name %>', {
		init: function( editor ) {
			console.log( '<%= name %> plugin is loaded!' );
		}
	} );
} )();