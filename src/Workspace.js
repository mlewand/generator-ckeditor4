/**
 * A class describing CKEditor 4 workspace.
 *
 * It can answer things like:
 * * What it the path to default plugins directory?
 * * What branch is currently used?
 * * What CKEditor version is it?
 *
 * @class Workspace
 */
class Workspace {

	/**
	 *
	 * @param {any} generator Yoeman generator instance.
	 * @memberOf Workspace
	 */
	constructor( generator ) {
		this.generator = generator;
	}

	/**
	 * @returns {String/null} Current branch name or null if can't be told.
	 * @memberOf Workspace
	 */
	getBranch() {
		let gitRevSync = require( 'git-rev-sync' );

		return gitRevSync.branch( this._getDirectoryPath() );
	}

	/**
	 * This method relies on our workflow, where we set `t/<ticketNumber>`, e.g. `t/12345` as our branch name.
	 *
	 * @returns {Number/null} Returns ticket number that's currently worked on, or `null`.
	 * @memberOf Workspace
	 */
	getTicketNumber() {
		let branch = this.getBranch();

		return branch.startsWith( 't/' ) ? parseInt( branch.substr( 2 ) ) : null;
	}

	/**
	 * @returns {String}
	 * @memberOf Workspace
	 */
	getVersion() {
		return this._getPackageInfo().version;
	}

	getRevision() {
		let gitRevSync = require( 'git-rev-sync' );

		return gitRevSync.short( this._getDirectoryPath() );
	}

	/**
	 * Returns a promise with all the plugins available in the workspace.
	 *
	 * @returns Promise<String[]>
	 * @memberOf Workspace
	 */
	getPlugins() {
		let fs = require( 'fs' ),
			path = require( 'path' ),
			pluginsDir = path.join( this._getDirectoryPath(), 'plugins' );

		return new Promise( ( resolve, reject ) => {
			fs.readdir( pluginsDir, ( err, files ) => {
				if ( err ) {
					if ( err.code === 'ENOENT' ) {
						// Simply return no results when plugins dir is not there.
						resolve( [] );
					} else {
						reject( err );
					}
				} else {
					files = files.filter( name => [ '.', '..' ].indexOf( name ) === -1 );

					let stats = files.map( name => new Promise( ( statsResolve, statsReject ) => {
						fs.stat( path.join( pluginsDir, name ), function( err, stats ) {
							if ( err ) {
								statsReject( err );
							} else {
								statsResolve( stats );
							}
						} );
					} ) );

					Promise.all( stats ).then( ( fileStats ) => {
						resolve( files.filter( ( val, index ) => {
							return fileStats[ index ].isDirectory();
						} ) );
					} );
				}
			} );
		} );
	}

	/**
	 * Returns parsed info from `package.json` as an object.
	 *
	 * @returns {Object}
	 * @memberOf Workspace
	 */
	_getPackageInfo() {
		let path = require( 'path' );

		if ( this._packageJson ) {
			return this._packageJson;
		}

		this._packageJson = require( `${this._getDirectoryPath()}${path.sep}package.json` );

		return this._packageJson;
	}

	/**
	 * @returns {String} Path to main CKEditor directory.
	 * @memberOf Workspace
	 */
	_getDirectoryPath() {
		return this.generator.destinationPath();
	}
}

module.exports = Workspace;