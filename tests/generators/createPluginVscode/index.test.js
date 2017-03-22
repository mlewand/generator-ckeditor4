
const path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	yoAssert = require( 'yeoman-assert' ),
	testedModulePath = '../../../generators/createPluginVscode/index',
	IssueGenerator = require( testedModulePath );

describe( 'VSCode additions', () => {
	it( 'adds entry to package.json', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.then( function( dir ) {
				expect( path.join( dir, 'package.json' ) ).to.be.a.file();

				yoAssert.jsonFileContent( path.join( dir, 'package.json' ), {
					devDependencies: {
						'@types/ckeditor': '^0.0.37'
					}
				} );
			} );
	} );

	it( 'doesnt play with package.josn if skipped', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.withOptions( {
				'skipVscode': true
			} )
			.then( function( dir ) {
				expect( path.join( dir, 'package.json' ) ).not.to.be.a.path();
			} );
	} );
} );