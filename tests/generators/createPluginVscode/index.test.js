
let path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	yoAssert = require( 'yeoman-assert' ),
	testedModulePath = '../../../generators/createPluginVscode/index';

let IssueGenerator = require( testedModulePath );

describe.only( 'VSCode additions', () => {
	describe( 'add', () => {
		it( 'opens correct URL', () => {
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
	} );
} );