
let path = require( 'path' ),
	GeneratorBase = require( '../src/GeneratorBase' );

describe( 'GeneratorBase', () => {

	describe( 'logVerbose()', () => {
		let mock;

		beforeEach( () => {
			mock = {
				log: sinon.stub(),
				logVerbose: GeneratorBase.prototype.logVerbose,
				options: {
					verbose: false
				}
			};
		});

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

} );