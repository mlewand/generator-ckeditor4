
const createPlugin = require( '../../../generators/createPlugin/index' ),
	compareDirectoryContents = require( '../../_helpers/compareDirectories' ),
	yeomanTest = require( 'yeoman-test' ),
	fsp = require( 'fs-promise' );

describe( 'ckeditor4:createPlugin', () => {
	it( 'creates a basic plugin', () => {
		return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
			.withArguments( 'my-plugin' )
			.inTmpDir()
			.then( tmpDir => {
				expect( path.join( tmpDir, 'my-plugin' ) ).to.be.a.directory();

				return compareDirectoryContents( path.join( __dirname, '_fixtures', 'expectedSimplePlugin' ),
					path.join( tmpDir, 'my-plugin' ),
					{
						skipEol: false,
						diff: true
					} );
			} );
	} );

	it( 'doesnt override existing dir', () => {
		return expect( yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'my-plugin' )
				.inTmpDir( tmpDir => {
					return fsp.mkdir( 'my-plugin' );
				} )
			).to.eventually.be.rejectedWith( Error, 'Directory "my-plugin" already exists.' );
	} );
} );