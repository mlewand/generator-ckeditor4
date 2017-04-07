'use strict';

const path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	testedModulePath = '../../../generators/createPluginVscode/index',
	IssueGenerator = require( testedModulePath );

describe( 'VSCode additions', () => {
	const npmInstallStub = sinon.stub( IssueGenerator.prototype, 'npmInstall' );

	beforeEach( () => npmInstallStub.reset() );

	after( () => npmInstallStub.restore() );

	it( 'adds entry to package.json', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.then( function( dir ) {
				expect( path.join( dir, 'package.json' ) ).to.be.a.file();

				expect( npmInstallStub ).to.be.calledWithExactly( [ '@types/ckeditor' ], { 'save-dev': true } );
			} );
	} );

	it( 'doesnt play with package.josn if skipped', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.withOptions( {
				'skipVscode': true
			} )
			.then( () => {
				expect( npmInstallStub ).not.to.be.calledWithExactly( [ '@types/ckeditor' ], { 'save-dev': true } );
			} );
	} );
} );