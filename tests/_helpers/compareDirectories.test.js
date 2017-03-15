
const path = require( 'path' ),
	compareDirectories = require( './compareDirectories' );

describe( 'compareDirectories', function() {
	it( 'Tells the drifference in EOLs', () => {
		let input = path.join( __dirname, '_fixtures', 'winEol' ),
			output = path.join( __dirname, '_fixtures', 'unixEol' );

		return expect( compareDirectories( output, input, {
			diff: true,
			skipEol: false
		} ) ).to.eventually.be.rejectedWith( 'is different from' );
	} );

	it( 'Skips EOL checks if requested', () => {
		let input = path.join( __dirname, '_fixtures', 'winEol' ),
			output = path.join( __dirname, '_fixtures', 'unixEol' );

		return compareDirectories( output, input, {
			diff: true,
			skipEol: true
		} );
	} );
} );