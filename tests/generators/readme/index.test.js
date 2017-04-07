'use strict';

const path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' );

describe( 'generator-ckeditor4:readme', function() {
	it( 'creates a readme', () => {
		return yeomanTest.run( path.join( __dirname, '../../../generators/readme' ) )
			.withArguments( [ 'foo-bar' ] )
			.withOptions( {
				description: 'This is a description.'
			} )
			.then( ( dir ) => {
				expect( path.join( dir, 'README.md' ) ).to.be.a.file().and.contents.equal( path.join( __dirname, '_fixtures', 'README.md' ) );
			} );
	} );
} );