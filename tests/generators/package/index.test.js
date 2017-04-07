'use strict';

const path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	yoAssert = require( 'yeoman-assert' ),
	testedModulePath = '../../../generators/package/index';

describe( 'package.json generator', () => {
	it( 'creates package.json', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.withPrompts( {
				author: 'aaa',
				description: 'sample desc'
			} )
			.withArguments( [ 'samplePlugin' ] )
			.then( function( dir ) {
				expect( path.join( dir, 'package.json' ) ).to.be.a.file();

				yoAssert.jsonFileContent( 'package.json', {
					name: 'ckeditor-plugin-samplePlugin',
					version: '0.0.0',
					description: 'sample desc',
					author: 'aaa',
					main: 'plugin.js',
					keywords: [],
					dependencies: {},
					devDependencies: {}
				} );
			} );
	} );

	it( 'reads options if provided', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.withOptions( {
				author: 'bbb',
				description: 'ccc'
			} )
			.withArguments( [ 'foo' ] )
			.then( function( dir ) {
				expect( path.join( dir, 'package.json' ) ).to.be.a.file();

				yoAssert.jsonFileContent( 'package.json', {
					name: 'ckeditor-plugin-foo',
					version: '0.0.0',
					description: 'ccc',
					author: 'bbb',
					main: 'plugin.js',
					keywords: [],
					dependencies: {},
					devDependencies: {}
				} );
			} );
	} );
} );