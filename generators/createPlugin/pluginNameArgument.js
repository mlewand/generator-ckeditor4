'use strict';

module.exports = {
	required: true,
	description: 'Name of the plugin.',
	type: function( val ) {
		val = String( val );
		let allowedRegexp = /^[a-z0-9\-_]+$/i;

		if ( !val.match( allowedRegexp ) ) {
			throw new Error( `Plugin name, "${val}" doesn't match allowed name regexp: ${allowedRegexp}.` );
		}

		return val;
	}
};