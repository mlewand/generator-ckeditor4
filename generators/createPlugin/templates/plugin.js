( function() {
	'use strict';

	CKEDITOR.plugins.add( '<%= name %>', {
		// <%- plugin.properties %>
		init: function( editor ) {
			console.log( '<%= name %> plugin is loaded!' );

			// <%- plugin.init %>
		}
	} );
} )();
