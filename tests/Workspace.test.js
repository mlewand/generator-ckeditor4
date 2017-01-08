
let path = require( 'path' ),
	testedModulePathFromRoot = '../src/Workspace',
	testedModulePath = '../../' + testedModulePathFromRoot,
	Workspace = require( testedModulePathFromRoot );

describe( 'Workspace', () => {

	describe( 'getPlugins()', () => {
		it( 'Returns correct value', () => {
			let workspaceStub = {
					_getDirectoryPath: sinon.stub().returns( path.join( __dirname, '_fixtures', 'Workspace', 'getPlugins' ) )
				};

			return Workspace.prototype.getPlugins.call( workspaceStub )
				.then( ( plugins ) => {
					expect( plugins ).to.be.an( 'array' );
					expect( plugins ).to.be.eql( [ 'bar', 'foo', 'undo' ] );
				} );
		} );

		it( 'Returns empty array with nonexisting plugins dir', () => {
			let workspaceStub = {
					_getDirectoryPath: sinon.stub().returns( path.join( __dirname, '_fixtures' ) )
				};

			return Workspace.prototype.getPlugins.call( workspaceStub )
				.then( ( plugins ) => {
					expect( plugins ).to.be.an( 'array' );
					expect( plugins ).to.be.eql( [] );
				} );
		} );
	} );

} );