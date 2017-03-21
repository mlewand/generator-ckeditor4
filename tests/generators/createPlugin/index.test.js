
const compareDirectoryContents = require( '../../_helpers/compareDirectories' ),
	yeomanTest = require( 'yeoman-test' ),
	fsp = require( 'fs-promise' ),
	fse = require( 'fs-extra' ),
	proxyquire = require( 'proxyquire' ),
	openStub = sinon.stub();

describe( 'ckeditor4:createPlugin', () => {
	before( () => {
		const CreatePluginGenerator = proxyquire( '../../../generators/createPlugin/index', {
			open: openStub
		} );

		var originalTplVars = CreatePluginGenerator.prototype._getTemplateVars;

		// Make sure that tests wont fail as year changes.
		CreatePluginGenerator.prototype._getTemplateVars = function( contribName ) {
			let ret = originalTplVars.call( this, contribName );

			ret.year = '2017';

			return ret;
		}

		after( () => {
			CreatePluginGenerator.prototype._getTemplateVars = originalTplVars;
		} );
	} );

	beforeEach( () => openStub.reset() );

	it( 'creates a basic plugin', () => {
		return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
			.withArguments( 'my-plugin' )
			.withOptions( {
				'skipTests': true,
				'skipSamples': true
			} )
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
			.withOptions( {
				'skipTests': true,
				'skipSamples': true
			} )
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
				expect( path.join( tmpDir, 'my-plugin' ) ).to.not.be.a.path();
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

	describe( 'open option', () => {
		it( 'is not called with default logic', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'custom-plugin' )
				.inTmpDir()
				.then( ( tmpDir ) => {
					expect( openStub ).not.to.be.called;
				} );
		} );

		it( 'supports opening plugin.js', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'custom-plugin' )
				.withOptions( {
					'open': true
				} )
				.inTmpDir()
				.then( ( tmpDir ) => {
					let expectedPath = path.join( tmpDir, 'custom-plugin', 'plugin.js' );

					if ( process.platform === 'darwin' && process.env.TRAVIS ) {
						// Travis will prefix the path with /private, but only for value returned by
						// GeneratorBase.destinationPath() and not by inTmpDir, because why not? ¯\_(ツ)_/¯ (#22)
						expectedPath = '/private' + expectedPath;
					}

					expect( openStub ).to.be.calledOnce;
					expect( openStub ).to.be.calledWithExactly( expectedPath );
				} );
		} );

		it( 'supports opening plugin.js with shortcut option', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'custom-plugin' )
				.withOptions( {
					'o': true
				} )
				.inTmpDir()
				.then( ( tmpDir ) => {
					let expectedPath = path.join( tmpDir, 'custom-plugin', 'plugin.js' );

					if ( process.platform === 'darwin' && process.env.TRAVIS ) {
						// Travis will prefix the path with /private, but only for value returned by
						// GeneratorBase.destinationPath() and not by inTmpDir, because why not? ¯\_(ツ)_/¯ (#22)
						expectedPath = '/private' + expectedPath;
					}

					expect( openStub ).to.be.calledOnce;
					expect( openStub ).to.be.calledWithExactly( expectedPath );
				} );
		} );
	} );

	describe( 'tests', () => {
		it( 'includes test directory', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'my-plugin' )
				.inTmpDir()
				.then( tmpDir => {
					expect( path.join( tmpDir, 'my-plugin', 'tests' ) ).to.be.a.directory();

					return compareDirectoryContents( path.join( __dirname, '_fixtures', 'expectedTests' ),
						path.join( tmpDir, 'my-plugin', 'tests' ),
						{
							skipEol: false,
							diff: true
						} );
				} );
		} );

		it( 'supports disabling tests directory', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'my-plugin' )
				.withOptions( {
					'skipTests': true
				} )
				.inTmpDir()
				.then( tmpDir => {
					expect( path.join( tmpDir, 'my-plugin', 'tests' ) ).not.to.be.a.path();
				} );
		} );
	} );

	describe( 'dialog', () => {
		it( 'works', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'my-plugin' )
				.withOptions( {
					dialog: true
				} )
				.inTmpDir()
				.then( tmpDir => {
					expect( path.join( tmpDir, 'my-plugin', 'dialogs' ) ).to.be.a.directory();
					expect( path.join( tmpDir, 'my-plugin', 'dialogs', 'my-plugin.js' ) ).to.be.a.file();

					return compareDirectoryContents( path.join( __dirname, '_fixtures', 'expectedDialogs' ),
						path.join( tmpDir, 'my-plugin', 'dialogs' ),
						{
							skipEol: false,
							diff: true
						} );
				} );
		} );
	} );

	describe( 'sample', () => {
		it( 'supports skipping sample', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'my-plugin' )
				.withOptions( {
					'skipSamples': true
				} )
				.inTmpDir()
				.then( tmpDir => {
					expect( path.join( tmpDir, 'my-plugin', 'samples' ) ).not.to.be.a.path();
				} );
		} );

		it( 'works', () => {
			return yeomanTest.run( path.join( __dirname, '../../../generators/createPlugin' ) )
				.withArguments( 'my-plugin' )
				.withOptions( {
					'skipSamples': false
				} )
				.inTmpDir()
				.then( tmpDir => {
					expect( path.join( tmpDir, 'my-plugin', 'samples' ) ).to.be.a.directory();

					return compareDirectoryContents( path.join( __dirname, '_fixtures', 'expectedSamples' ),
						path.join( tmpDir, 'my-plugin', 'samples' ),
						{
							skipEol: false,
							diff: true
						} );
				} );
		} );
	} );

} );