let path = require( 'path' ),
	testedModulePathFromRoot = '../src/Workspace',
	testedModulePath = '../../' + testedModulePathFromRoot,
	Workspace = require( testedModulePathFromRoot );

describe( 'Workspace', () => {

	let mock;

	beforeEach( () => {
		// We need to stub _guessWorkspaceRoot, otherwise constructor will validate given path and throw an error.
		sinon.stub( Workspace.prototype, '_guessWorkspaceRoot' ).returns( '/foo/bar' );

		mock = new Workspace( '/foo/bar' );
	} );


	afterEach( () => {
		if ( Workspace.prototype._guessWorkspaceRoot.restore ) {
			Workspace.prototype._guessWorkspaceRoot.restore();
		}
	} );


	describe( 'constructor', () => {
		it( 'sets path with ret from _guessWorkspaceRoot', () => {
			// sinon.stub( Workspace.prototype, '_guessWorkspaceRoot' ).returns( '/this/editor/surely/exists' );
			Workspace.prototype._guessWorkspaceRoot.returns( '/this/editor/surely/exists' );

			mock = new Workspace( '/non/existing/path' );

			// Workspace.prototype._guessWorkspaceRoot.restore();

			// expect( mock._path ).to.be.equal( '/this/editor/surely/exists' );
		} );

		it( 'throws when _guessWorkspaceRoot returns invalid path', () => {
			Workspace.prototype._guessWorkspaceRoot.returns( null );

			expect( () => new Workspace( '/non/existing/path' ) ).to.throw( Error, 'Sorry, can\'t locate CKEditor 4 in "/non/existing/path" path.' );
		} );
	} );

	describe( 'getPlugins()', () => {
		let workspaceStub;

		beforeEach( () => {
			workspaceStub = {
				_getDirectoryPath: sinon.stub().returns( path.join( __dirname, '_fixtures' ) ),
				getPluginsPath: sinon.spy( function() {
					return path.join( this._getDirectoryPath(), 'plugins' );
				} )
			};
		} );

		it( 'Returns correct value', () => {
			workspaceStub._getDirectoryPath = sinon.stub().returns( path.join( __dirname, '_fixtures', 'Workspace', 'getPlugins' ) );

			return Workspace.prototype.getPlugins.call( workspaceStub )
				.then( ( plugins ) => {
					expect( plugins ).to.be.an( 'array' );
					expect( plugins ).to.be.eql( [ 'bar', 'foo', 'undo' ] );
				} );
		} );

		it( 'Returns empty array with nonexisting plugins dir', () => {

			return Workspace.prototype.getPlugins.call( workspaceStub )
				.then( ( plugins ) => {
					expect( plugins ).to.be.an( 'array' );
					expect( plugins ).to.be.eql( [] );
				} );
		} );
	} );

	describe( '_getDirectoryPath', () => {
		it( 'Returns path', () => {
			mock._path = path.join( 'foo', 'bar', 'baz' );

			expect( mock._getDirectoryPath() ).to.be.equal( mock._path );
		} );
	} );


	describe( '_guessWorkspaceRoot()', () => {

		beforeEach( () => {
			// Here we want to test the real thing!
			Workspace.prototype._guessWorkspaceRoot.restore();
		} );


		let topMostDir = path.join( __dirname, '_fixtures', 'Workspace', '_guessWorkspaceRoot', 'topMostCke' ),
			innerMostDir = path.join( topMostDir, 'subdir', 'innerMostCke' );

		it( 'Works correctly when given CKE4 root dir', () => {
			expect( mock._guessWorkspaceRoot( topMostDir ) ).to.be.equal( topMostDir );
		} );

		it( 'Works correctly when given CKE4 root sub directory', () => {
			expect( mock._guessWorkspaceRoot( path.join( topMostDir, 'subdir' ) ) ).to.be.equal( topMostDir );
		} );

		it( 'Works with CKE4 root dir nested into other CKE4 dir', () => {
			expect( mock._guessWorkspaceRoot( innerMostDir ) ).to.be.equal( innerMostDir );
		} );

		it( 'Works with CKE4 sub dir nested into other CKE4 dir', () => {
			expect( mock._guessWorkspaceRoot( path.join( innerMostDir, 'foo', 'bar' ) ) ).to.be.equal( innerMostDir );
		} );

		it( 'Informs about invalid directory', () => {
			var topMostDir = path.join( __dirname );

			expect( mock._guessWorkspaceRoot( topMostDir ) ).to.be.null;
		} );

	} );


} );