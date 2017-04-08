'use strict';

const path = require( 'path' ),
	fs = require( 'fs' ),
	fsp = require( 'fs-promise' ),
	yeomanTest = require( 'yeoman-test' ),
	rimraf = require( 'rimraf' ),
	// Don't remove it or else a scary unicorn will eat you.
	BuildGenerator = require( '../../../generators/build/index' ), // eslint-disable-line
	GeneratorBase = require( '../../../src/GeneratorBase' ),
	Workspace = require( '../../../src/Workspace' ),
	compareDirectoryContents = require( '../../_helpers/compareDirectories' );

describe( 'BuildGenerator integration tests', function() {
	// Each integration test might take a little while...
	this.timeout( 20000 );
	let ckePath = path.join( __dirname, '_fixtures', 'source' ),
		generatorPath = path.join( __dirname, '..', '..', '..', 'generators', 'build' ),
		revisionStub,
		options,
		outputPath,
		expectedBuildPath,
		createWorkspaceStub;

	before( () => {
		createWorkspaceStub = sinon.stub( GeneratorBase.prototype, '_createWorkspace', () => {
			let ret = new Workspace( ckePath );

			ret.getRevision = sinon.stub().returns( revisionStub );

			return ret;
		} );
	} );

	after( () => {
		createWorkspaceStub.restore();
	} );

	beforeEach( () => {
		// Reset variables that might get overridden in a test case.
		outputPath = path.join( ckePath, '..', 'actual' );
		expectedBuildPath = path.join( ckePath, '..', 'expected' );
		revisionStub = '2746a2b';

		options = {
			verbose: true,
			preset: 'micro',
			outputDir: outputPath,
			timestamp: 1489100400
		};
	} );

	afterEach( ( done ) => {
		// Clean after yourself!
		rimraf( outputPath, done );
	} );

	function testIntegrationBuild() {
		// First: remove previous build if any.
		return new Promise( ( resolve, reject ) => {
			rimraf( outputPath, err => {
				return err ? reject( err ) : resolve();
			} );
		} )
			.then( () => {
				// Then Mock yoeman instance.
				let context = yeomanTest.run( generatorPath );

				// context.on( 'ready', ( generator ) => {
				// 	// If we want to make real logs, so we can see in the console what is going on.
				// 	generator.log = console.log;
				// } );

				context.withOptions( options );

				return context;
			} );
	}

	it( 'Makes a valid build', () => {
		// Make sure that build directory does not exist.
		return testIntegrationBuild()
			.then( () => {
				return compareDirectoryContents( expectedBuildPath, outputPath );
			} );
	} );

	it( 'Makes a valid unminified build', () => {
		outputPath = path.join( ckePath, '..', 'actual-unminified' );
		expectedBuildPath = path.join( ckePath, '..', 'expected-unminified' );
		options.minify = false;
		options.outputDir = outputPath;
		revisionStub = '8085b10';

		return testIntegrationBuild()
			.then( () => {
				return compareDirectoryContents( expectedBuildPath, outputPath );
			} );
	} );

	it( 'Makes a build with external git-referenced plugins', () => {
		// Make unminified for better speed.
		options.minify = false;
		options.preset = 'test-git-plugin';

		return testIntegrationBuild()
			.then( () => {
				// Note that dummy plugin will get copied to ckeditor/plugins directory. We want to make sure it was removed from there once the build
				// is done.
				return expect( path.join( ckePath, 'plugins', 'dummy' ) ).to.not.be.a.path();
			} )
			.then( () => {
				// Plugin at referenced revision contains 'Dummy plugin is loaded!' string, make sure it gets inlined into ckeditor.js.
				return fsp.readFile( path.join( outputPath, 'ckeditor', 'ckeditor.js' ), { encoding: 'utf-8' } )
					.then( content => {
						expect( content ).to.contain( 'Dummy plugin is loaded!' );
					} );
			} );
	} );

	it( 'Makes a build with external git-referenced plugins', () => {
		// This test point to a particular revision in a git repository.
		options.minify = false;
		options.preset = 'test-git-plugin-hash';

		return testIntegrationBuild()
			.then( () => {
				// Note that dummy plugin will get copied to ckeditor/plugins directory. We want to make sure it was removed from there once the build
				// is done.
				return expect( path.join( ckePath, 'plugins', 'dummy' ) ).to.not.be.a.path();
			} )
			.then( () => {
				// Plugin at referenced revision contains 'Dummy plugin loaded!' string, make sure it gets inlined into ckeditor.js.
				return fsp.readFile( path.join( outputPath, 'ckeditor', 'ckeditor.js' ), { encoding: 'utf-8' } )
					.then( content => {
						expect( content ).to.contain( 'Dummy plugin loaded!' );
					} );
			} );
	} );

	it( 'Throws error when target directory exists and with overwrite=false flag', () => {
		options.overwrite = false;
		outputPath = path.join( ckePath, '..', 'actual-unminified' );

		fs.mkdirSync( outputPath );

		return expect( testIntegrationBuild() ).to.be.rejectedWith( Error, /^Output directory ".+?" already exists.$/ );
	} );
} );