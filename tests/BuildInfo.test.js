const path = require( 'path' ),
	testedModulePathFromRoot = '../src/BuildInfo',
	BuildInfo = require( testedModulePathFromRoot );

describe( 'BuildInfo', () => {
	describe( 'getArguments()', () => {
		it( 'serializes default values correctly', () => {
			let config = {
					jarPath: 'foo/ckbuilder.jar',
					targetDir: 'ckediotr-dev/output/build',
					sourceDir: 'ckeditor-dev',
					preset: 'basic',
					presetPath: 'presets/basic-build-config.js'
				},
				workspaceStub = {
					getVersion: sinon.stub().returns( '4.6.0' ),
					getRevision: sinon.stub().returns( '123abc' )
				},
				instance = new BuildInfo( config, workspaceStub ),
				expected = [
					'-jar', config.jarPath,
					'--build', config.sourceDir,
					config.targetDir,
					'--version', '4.6.0 (basic)',
					'--revision', '123abc',
					'--build-config', 'presets/basic-build-config.js',
				];

			expect( instance.getArguments() ).to.be.eql( expected );
		} );

		it( 'serializes custom config correctly', () => {
			let config = {
					jarPath: 'foo/ckbuilder.jar',
					targetDir: 'ckediotr-dev/output/build',
					sourceDir: 'ckeditor-dev',
					preset: 'full',
					presetPath: 'presets/full-build-config.js',
					overwrite: true,
					zip: false,
					tar: false,
					skip: true
				},
				workspaceStub = {
					getVersion: sinon.stub().returns( '4.5.3' ),
					getRevision: sinon.stub().returns( 'abcabc' )
				},
				instance = new BuildInfo( config, workspaceStub ),
				expected = [
					'-jar', config.jarPath,
					'--build', config.sourceDir,
					config.targetDir,
					'--version', '4.5.3 (full)',
					'--revision', 'abcabc',
					'--build-config', 'presets/full-build-config.js',
					'--overwrite',
					'--no-zip',
					'--no-tar',
					'-s'
				];

			expect( instance.getArguments() ).to.be.eql( expected );
		} );
	} );


	describe( 'getPlugins', () => {
		it( 'Returns valid type', () => {
			let mock = {
				presetPath: path.join( __dirname, '_fixtures', 'BuildInfo', 'sample-cfg.js' ),
				_parsePresetConfig: BuildInfo.prototype._parsePresetConfig
			};

			expect( BuildInfo.prototype.getPlugins.call( mock ) ).to.be.an( 'promise' );
		} );

		it( 'Returns valid value', () => {
			let mock = {
				presetPath: path.join( __dirname, '_fixtures', 'BuildInfo', 'sample-cfg.js' ),
				_parsePresetConfig: BuildInfo.prototype._parsePresetConfig
			};

			return BuildInfo.prototype.getPlugins.call( mock )
				.then( ( result ) => {
					expect( result ).to.be.a( 'object' );
					expect( result ).to.be.eql( {
						a11yhelp: 1,
						tab: 1,
						wsc: 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd'
					} );
				} );
		} );
	} );


	describe( '_parsePresetConfig', () => {
		it( 'returns a promise', () => {
			let jsPath = path.join( __dirname, '_fixtures', 'BuildInfo', 'sample-cfg.js' );

			expect( BuildInfo.prototype._parsePresetConfig.call( null, jsPath ) ).to.be.a( 'promise' );
		} );

		it( 'parses js file', () => {
			let jsPath = path.join( __dirname, '_fixtures', 'BuildInfo', 'sample-cfg.js' );

			return BuildInfo.prototype._parsePresetConfig.call( null, jsPath )
				.then( ( result ) => {
					expect( result ).to.be.a( 'object' );
					expect( result ).to.be.deep.eql( {
						skin: 'moono-lisa',
						ignore: [
							'bender.js',
							'.bender',
						],
						plugins: {
							a11yhelp: 1,
							tab: 1,
							wsc: 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd'
						}
					} );
				} );
		} );

		it( 'rejects the promise if there is no CKBUILDER_CONFIG', () => {
			let jsPath = path.join( __dirname, '_fixtures', 'BuildInfo', 'wrong-cfg.js' );

			return expect( BuildInfo.prototype._parsePresetConfig.call( null, jsPath ) )
				.to.be.rejectedWith( Error, 'Parsed preset config did not expose CKBUILDER_CONFIG variable.' );
		} );
	} );
} );