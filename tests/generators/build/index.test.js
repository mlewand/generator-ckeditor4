'use strict';

const path = require( 'path' ),
	gitCloneStub = sinon.spy( function( url, path, opts, callback ) {
		callback();
	} ),
	BuildGenerator = proxyquire( '../generators/build/index', {
		'git-clone': gitCloneStub
	} );

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
					expect( res ).to.be['null'];
				} );
		} );
	} );

	describe( '_cloneExternalPlugin', () => {
		it( 'Supports revision in URL', () => {
			let testUrl = 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd',
				mock = {
					logVerbose: sinon.stub(),
					_getWorkspace: sinon.stub().returns( {
						getPluginsPath: sinon.stub().returns( 'plugins/' )
					} )
				};

			return BuildGenerator.prototype._cloneExternalPlugin.call( mock, testUrl, 'wsc' )
				.then( () => {
					expect( gitCloneStub ).to.be.calledOnce;
					expect( gitCloneStub ).to.be.calledWith( 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc', path.join( 'plugins', 'wsc' ), {
						checkout: 'b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd'
					} );
				} );
		} );
	} );
} );