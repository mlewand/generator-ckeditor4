
let path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	openStub = sinon.stub(),
	testedModulePathFromRoot = '../generators/issue/index',
	testedModulePath = '../../' + testedModulePathFromRoot;

proxyquire( testedModulePathFromRoot, {
	open: openStub
} );

let IssueGenerator = require( testedModulePath );

describe( 'Sample ts', () => {
	beforeEach( () => {
		openStub.reset();
	} );

	describe( 'add', () => {
		it( 'opens correct URL', () => {
			return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
				.withArguments( [ 'add' ] )
				.then( function() {
					expect( openStub ).to.be.calledWith( 'https://dev.ckeditor.com/newticket' );
					expect( openStub ).to.be.calledOnce;
				} );
		} );
	} );

	describe( 'roadmap', () => {
		it( 'opens correct URL', () => {
			return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
				.withArguments( [ 'roadmap' ] )
				.then( function() {
					expect( openStub ).to.be.calledWith( 'https://dev.ckeditor.com/roadmap' );
					expect( openStub ).to.be.calledOnce;
				} );
		} );
	} );

	describe( 'open', () => {
		let stub;

		before( () => {
			IssueGenerator.prototype._getWorkspace = sinon.stub().returns( {
				getTicketNumber: sinon.stub().returns( 12345 )
			} );

			stub = IssueGenerator.prototype._getWorkspace;
		} );

		after( () => {
			delete IssueGenerator.prototype._getWorkspace;
		} );

		it( 'picks version from argument if given', () => {
			return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
				.withArguments( [ 'open', '123' ] )
				.then( function() {
					expect( openStub ).to.be.calledWith( 'https://dev.ckeditor.com/ticket/123' );
					expect( openStub ).to.be.calledOnce;
				} );
		} );

		it( 'picks ticket from workspace if not given', () => {
			return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
				.withArguments( [ 'open' ] )
				.then( function() {
					expect( openStub ).to.be.calledWith( 'https://dev.ckeditor.com/ticket/12345' );
					expect( openStub ).to.be.calledOnce;
				} );
		} );

		it( 'throws an error if ticket number cant be determined', () => {
			IssueGenerator.prototype._getWorkspace = sinon.stub().returns( {
				getTicketNumber: sinon.stub().returns( null )
			} );

			return expect( yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
					.withArguments( [ 'open' ] )
					.then( function() {
						// Restore original stub.
						IssueGenerator.prototype._getWorkspace = stub;
					} )
				).to.be.rejectedWith( Error, 'Invalid ticket number given (resolved to "null").' );
		} );
	} );

	describe( 'milestone', () => {
		before( () => {
			IssueGenerator.prototype._getWorkspace = sinon.stub().returns( {
				getVersion: sinon.stub().returns( '4.4.1' )
			} );
		} );

		after( () => {
			delete IssueGenerator.prototype._getWorkspace;
		} );

		it( 'picks version from argument if given', () => {
			return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
				.withArguments( [ 'milestone', '4.6.2' ] )
				.then( function() {
					expect( openStub ).to.be.calledWith( 'http://dev.ckeditor.com/milestone/CKEditor%204.6.2' );
					expect( openStub ).to.be.calledOnce;
				} );
		} );

		it( 'picks version from workspace if not given', () => {
			return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
				.withArguments( [ 'milestone' ] )
				.then( function() {
					expect( openStub ).to.be.calledWith( 'http://dev.ckeditor.com/milestone/CKEditor%204.4.1' );
					expect( openStub ).to.be.calledOnce;
				} );
		} );

		it( 'throws exception if invalid given', () => {
			return expect(
					yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
						.withArguments( [ 'milestone', '4.2' ] )
				).to.be.rejectedWith( Error, 'Invalid version "4.2" given.' );
		} );
	} );

} );