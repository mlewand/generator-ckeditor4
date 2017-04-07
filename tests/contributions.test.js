'use strict';

const contributions = require( './../src/contributions' );

describe( 'contributions', () => {
	afterEach( () => contributions.reset() );

	describe( 'add', () => {
		it( 'adds to empty', () => {
			contributions.add( {
				_testEmpty: {
					foo: 1,
					bar: 'baz'
				}
			} );

			expect( contributions.get() ).to.be.eql( {
				_testEmpty: {
					foo: 1,
					bar: 'baz'
				}
			} );
		} );

		it( 'doesnt override empty with values', () => {
			contributions.add( {
				foo: {
					bar: []
				}
			} );

			contributions.add( {
				foo: {
					bar: [ 1, 2 ]
				}
			} );

			expect( contributions.get().foo.bar ).to.be.eql( [ 1, 2 ] );
		} );

		it( 'merges object', () => {
			contributions.add( {
				_testMerge: {
					foo: 1
				}
			} );

			contributions.add( {
				_testMerge: {
					bar: 2
				}
			} );

			expect( contributions.get() ).to.be.eql( {
				_testMerge: {
					foo: 1,
					bar: 2
				}
			} );
		} );
	} );
} );