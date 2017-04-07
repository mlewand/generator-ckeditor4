const path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	GeneratorBase = require( '../src/GeneratorBase' );

describe( 'GeneratorBase', () => {
	let createWorkspaceStub,
		mock;

	beforeEach( () => {
		mock = {
			log: sinon.stub(),
			logVerbose: GeneratorBase.prototype.logVerbose,
			options: {
				verbose: false
			},
			_getWorkspace: GeneratorBase.prototype._getWorkspace,
			_createWorkspace: createWorkspaceStub,
			destinationPath: sinon.stub().returns( '/sample/destinationPath' )
		};

		createWorkspaceStub.reset();
		createWorkspaceStub.reset();
	} );

	before( () => {
		createWorkspaceStub = sinon.stub( GeneratorBase.prototype, '_createWorkspace' ).returns( 1 );
	} );

	after( () => {
		createWorkspaceStub.restore();
	} );

	describe( 'logVerbose()', () => {
		it( 'Logs when verbose option was given', () => {
			mock.options.verbose = true;
			mock.logVerbose( 'foobar' );

			expect( mock.log ).to.be.calledOnce;
			expect( mock.log ).to.be.calledWithExactly( 'foobar' );
		} );

		it( 'Sits quite when options.verbose is set to false', () => {
			mock.logVerbose( 'test' );

			expect( mock.log ).not.to.be.called;
		} );
	} );


	describe( '_getWorkspace()', () => {
		it( 'creates Workspace instance once', () => {
			mock._getWorkspace();
			mock._getWorkspace();
			mock._getWorkspace();

			expect( createWorkspaceStub ).to.be.calledOnce;
		} );

		it( 'Uses CKEDITOR_DEV_PATH env if dev option is on', () => {
			let envCkePath = '/custom/env/path/ckeditor-dev',
				initialEnvValue = process.env.CKEDITOR_DEV_PATH;

			mock.options.dev = true;

			process.env.CKEDITOR_DEV_PATH = envCkePath;

			mock._getWorkspace();

			process.env.CKEDITOR_DEV_PATH = initialEnvValue;

			expect( createWorkspaceStub ).to.be.calledOnce;
			expect( createWorkspaceStub ).to.be.calledWithExactly( envCkePath );
		} );

		it( 'Uses destinationPath', () => {
			mock._getWorkspace();

			expect( createWorkspaceStub ).to.be.calledOnce;
			expect( createWorkspaceStub ).to.be.calledWithExactly( '/sample/destinationPath' );
		} );
	} );
} );