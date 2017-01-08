
let path = require( 'path' ),
	testedModulePathFromRoot = '../src/BuildInfo',
	testedModulePath = '../../' + testedModulePathFromRoot,
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

} );