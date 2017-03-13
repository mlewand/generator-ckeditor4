
const createPlugin = require( '../../../generators/createPlugin/index' ),
	compareDirectoryContents = require( '../../_helpers/compareDirectories' ),
	yeomanTest = require( 'yeoman-test' ),
	fsp = require( 'fs-promise' ),
	fse = require( 'fs-extra' );

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

	it( 'creates a basic plugin in a workspace', () => {
		return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
			.withArguments( 'my-plugin' )
			.inTmpDir( function( tmpDir ) {
				// Let's recreate a dir structure reminding a valid CKE4 installation.
				let done = this.async();

				return fse.copy(
						path.join( __dirname, '..', '..', '_fixtures', 'Workspace', '_guessWorkspaceRoot', 'topMostCke' ),
						tmpDir,
						done
					);
			} )
			.then( tmpDir => {
				expect( path.join( tmpDir, 'ckeditor.js' ) ).to.be.a.file();
				expect( path.join( tmpDir, 'my-plugin' ) ).not.to.be.a.directory();
				expect( path.join( tmpDir, 'plugins', 'my-plugin' ) ).to.be.a.directory();

				return compareDirectoryContents( path.join( __dirname, '_fixtures', 'expectedSimplePlugin' ),
					path.join( tmpDir, 'plugins', 'my-plugin' ),
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