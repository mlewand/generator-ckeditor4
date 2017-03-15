const path = require( 'path' ),
	fs = require( 'fs' );

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
	 * @param {String} path Path to CKEditor main directory.
	 * @memberOf Workspace
	 */
	constructor( path ) {
		this._path = this._guessWorkspaceRoot( path );

		if ( this._path === null ) {
			throw new Error( `Sorry, can't locate CKEditor 4 in "${path}" path.` );
		}
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

	/**
	 * Returns a revision for workspace CKEditor instance.
	 *
	 * @returns {String/null} Revision or `null` if can not be determined.
	 * @memberOf Workspace
	 */
	getRevision() {
		let gitRevSync = require( 'git-rev-sync' );

		try {
			return gitRevSync.short( this._getDirectoryPath() );
		} catch ( e ) {
			if ( e instanceof Error && e.toString().match( /no git repository found/ ) ) {
				// Return null if it's not a git repo, and hash can not be determined.
				return null;
			} else {
				// Still unhandled.
				throw e;
			}
		}
	}

	/**
	 * Returns a promise with all the plugins available in the workspace.
	 *
	 * @returns Promise<String[]>
	 * @memberOf Workspace
	 */
	getPlugins() {
		let path = require( 'path' ),
			pluginsDir = this.getPluginsPath();

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
	 * @returns {String} Path to the plugins directory.
	 * @memberOf Workspace
	 */
	getPluginsPath() {
		return path.join( this._getDirectoryPath(), 'plugins' );
	}

	/**
	 *
	 * @param {String} [dirPath=null] If not provided {@link #_path} is used.
	 * @returns {Boolean} Tells whether this workspace, looks like a real CKEditor 4 installation. If `false`
	 * it means that the generator is probably called from some random directory.
	 */
	isValidCKEditorSync( dirPath ) {
		dirPath = dirPath || this._path;

		return fs.existsSync( path.join( dirPath, 'ckeditor.js' ) ) && fs.existsSync( path.join( dirPath, 'plugins' ) );
	}

	/**
	 * Returns parsed info from `package.json` as an object.
	 *
	 * @returns {Object}
	 * @memberOf Workspace
	 */
	_getPackageInfo() {
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
		return this._path;
	}

	/**
	 * Based on given `startPath` tries to find closest main CKEditor 4 directory.
	 *
	 * In essence this method will start looking for CKEditor 4 directory structure, starting with `startPath` and
	 * going thru it's parents.
	 *
	 * @param {String} startPath
	 * @returns {String/null} Best matched directory, or `null` if none succeed.
	 * @memberOf Workspace
	 */
	_guessWorkspaceRoot( startPath ) {
		let parsed = path.parse( startPath ),
			directories = parsed.dir.substr( parsed.root.length ).split( path.sep ),
			// @todo: reuse isValidCKEditorSync method.
			dirHasCKe = dirPath => fs.existsSync( path.join( dirPath, 'ckeditor.js' ) ) && fs.existsSync( path.join( dirPath, 'plugins' ) );

		directories.push( parsed.name )

		// NOTE: initializing with directories.length instead of decreasing it by one is **intentional** here.
		for ( let i = 0; i <= directories.length; i++ ) {
			let curDir = path.join( parsed.root, ...directories.slice( 0, directories.length - i ) );
			if ( dirHasCKe( curDir ) ) {
				return curDir;
			}
		}

		return null;
	}
}

module.exports = Workspace;