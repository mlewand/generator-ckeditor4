
// This module exports contributions object.
// The main goal here is for contribution object to be shared across different generators, as often
// times subgenerators need to report some plugin.js contribution.

// For example, button plugin needs to add toolbar to the require property, icons, hidpi and ui registration itself.

const _ = require( 'lodash' ),
	dictionary = {};

module.exports = {
	add( input ) {
		_.merge( dictionary, input )
	},
	reset() {
		for( let i in dictionary ) {
			if ( dictionary.hasOwnProperty( i ) ) {
				delete dictionary[ i ];
			}
		}
	},
	get() {
		return dictionary;
	}
};