( function() {
	'use strict';

	/*
	 * An assertion to compare directory contents.
	 *
	 * The important goal here is to compare text files without checking line-endings.
	 *
	 * @todo: it make sense to extract it into a separate module.
	 */

	function compareDirectories( expected, actual ) {
		let readdir = require( 'recursive-readdir' ),
			fsp = require( 'fs-promise' ),
			normalizePaths = ( baseDir, paths ) => paths.map( curPath => {
				let ret = curPath.replace( baseDir, '' );

				if ( ret.startsWith( path.sep ) ) {
					ret = ret.substr( 1 );
				}

				return ret;
			} );

		return Promise.all( [ new Promise( ( resolve, reject ) => {
			readdir( expected, ( err, files ) => {
				return err ? reject( err ) : resolve( normalizePaths( expected, files ) );
			} );
		} ), new Promise( ( resolve, reject ) => {
			readdir( actual, ( err, files ) => {
				return err ? reject( err ) : resolve( normalizePaths( actual, files ) );
			} );
		} ) ] ).then( ( values ) => {
			// Return unique file paths based on both directories.
			return new Set( values[ 0 ].concat( values[ 1 ] ) );
		} ).then( paths => {
			let decorate = ( directoryType, filePath ) => fileContent => ( {
					content: fileContent,
					dirType: directoryType,
					path: filePath
				} ),
				compare = ( vals ) => {
					let fileInfo = path.parse( vals[ 0 ].path ),
						isText = [ '.md', '.js', '.css' ].indexOf( fileInfo.ext ) !== -1,
						fixEol = buff => buff.toString().replace( /[\r\n]/g, '' ),
						expected = vals[ 0 ].content,
						actual = vals[ 1 ].content,
						areSame;

					if ( isText ) {
						expected = fixEol( vals[ 0 ].content );
						actual = fixEol( vals[ 1 ].content );
						areSame = actual === expected;
					} else {
						areSame = actual.equals( expected );
					}

					// expect( actual, `${vals[ 1 ].path} is different from ${vals[ 0 ].path}` ).to.be.eql( expected );
					if ( !areSame ) {
						// It doesn't make sense to show diff, as it will get too large.
						require( 'assert' ).ok( false, `${vals[ 1 ].path} is different from ${vals[ 0 ].path}` );
					}
				};

			let promises = Array.from( paths ).map( curPath => {
				return Promise.all( [
						fsp.readFile( path.join( expected, curPath ) )
						.then( decorate( 'expected', path.join( expected, curPath ) ) ),
						fsp.readFile( path.join( actual, curPath ) )
						.then( decorate( 'actual', path.join( actual, curPath ) ) )
					] )
					.then( compare );
			} );

			return Promise.all( promises );
		} );
	}

	module.exports = compareDirectories;
} )();