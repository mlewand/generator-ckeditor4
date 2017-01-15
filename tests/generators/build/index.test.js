let path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	rimraf = require( 'rimraf' ),
	gitCloneStub = sinon.spy( function( url, path, opts, callback ) {
		callback();
	} ),
	testedModulePathFromRoot = '../generators/build/index',
	testedModulePath = '../../' + testedModulePathFromRoot;

proxyquire( testedModulePathFromRoot, {
	'git-clone': gitCloneStub
} );

let BuildGenerator = require( testedModulePath );

let compareDirectoryContents = require( '../../_helpers/compareDirectories' );

describe( 'BuildGenerator', () => {
	beforeEach( () => {
		gitCloneStub.reset();
	} );

	describe( '_checkPlugins', () => {
		let workspace,
			buildinfo;

		beforeEach( () => {
			workspace = {
				getPlugins: sinon.stub().returns( [ 'toolbar', 'wysiwygarea', 'link' ] )
			};
			buildinfo = {
				getPlugins: sinon.stub().returns( {
					toolbar: 1,
					wsc: 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd',
					openlink: 'https://github.com/mlewand/ckeditor-plugin-openlink.git'
				} )
			};
		} );

		it( 'Figures missing plugins', () => {
			return BuildGenerator.prototype._checkPlugins( workspace, buildinfo )
				.then( ( res ) => {
					expect( res ).to.be.eql( {
						openlink: 'https://github.com/mlewand/ckeditor-plugin-openlink.git',
						wsc: 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd'
					} );
				} );
		} );

		it( 'Returns null when all plugins are present', () => {
			workspace = {
				getPlugins: sinon.stub().returns( [ 'toolbar', 'wsc', 'openlink' ] )
			};

			return BuildGenerator.prototype._checkPlugins( workspace, buildinfo )
				.then( ( res ) => {
					expect( res ).to.be.null;
				} );
		} );
	} );

	describe( '_cloneExternalPlugin', () => {
		it( 'Supports revision in URL', () => {
			let testUrl = 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd',
				mock = {
					logVerbose: sinon.stub()
				};

			return BuildGenerator.prototype._cloneExternalPlugin.call( mock, testUrl, 'wsc' )
				.then( () => {
					expect( gitCloneStub ).to.be.calledOnce;
					expect( gitCloneStub ).to.be.calledWith( 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc', 'wsc', {
						checkout: 'b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd'
					} );

					return sinon.stub().resolves();
				} );
		} );
	} );


	describe( 'integration tests', function() {
		// Each integration test might take a little while...
		this.timeout( 20000 );
		let ckePath = path.join( __dirname, '_fixtures', 'microcke' ),
			generatorPath = path.join( __dirname, '..', '..', '..', 'generators', 'build' );

		it( 'Makes a valid build', () => {
			let outputPath = path.join( ckePath, '..', 'build' ),
				expectedBuildPath = path.join( ckePath, '..', 'microbuilt' );

			// Make sure that build directory does not exist.
			return new Promise( ( resolve, reject ) => {
					rimraf( outputPath, err => {
						return err ? reject( err ) : resolve();
					} );
				} )
				.then( () => {
					let context = yeomanTest.run( generatorPath );

					context.on( 'ready', ( generator ) => {
						// We need to patch generator ever so slightly, so it returns desired workspace path.
						generator._getWorkspace()._getDirectoryPath = sinon.stub().returns( ckePath );
						generator._getWorkspace().getRevision = sinon.stub().returns( '2746a2b' );
						generator._getWorkspace()._path = ckePath;

						// We want to make real logs, so we can see in the console what is going on.
						// generator.log = console.log;
					} );

					context.withOptions( {
						verbose: true,
						preset: 'micro',
						outputDir: outputPath,
						timestamp: 1489100400
					} );

					return context;
				} ).then( () => {
					return compareDirectoryContents( expectedBuildPath, outputPath );
				} );
		} );

		it( 'Makes a valid unminified build', () => {
			let outputPath = path.join( ckePath, '..', 'build-source' ),
				expectedBuildPath = path.join( ckePath, '..', 'microbuilt-source' );

			// Make sure that build directory does not exist.
			return new Promise( ( resolve, reject ) => {
					rimraf( outputPath, err => {
						return err ? reject( err ) : resolve();
					} );
				} )
				.then( () => {
					let context = yeomanTest.run( generatorPath );

					context.on( 'ready', ( generator ) => {
						// We need to patch generator ever so slightly, so it returns desired workspace path.
						generator._getWorkspace()._getDirectoryPath = sinon.stub().returns( ckePath );
						generator._getWorkspace().getRevision = sinon.stub().returns( '8085b10' );

						generator._getWorkspace()._path = ckePath;

						// We want to make real logs, so we can see in the console what is going on.
						// generator.log = console.log;
					} );

					context.withOptions( {
						verbose: true,
						minify: false,
						preset: 'micro',
						outputDir: outputPath,
						timestamp: 1489100400
					} );

					return context;
				} ).then( () => {
					return compareDirectoryContents( expectedBuildPath, outputPath );
				} );
		} );

	} );
} );