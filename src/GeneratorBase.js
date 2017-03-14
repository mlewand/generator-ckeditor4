var Workspace = require( './Workspace' ),
	Generator = require( 'yeoman-generator' );

/**
 * Abstract base class for generators.
 *
 * @class GeneratorBase
 * @extends {Generator}
 */
class GeneratorBase extends Generator {
	constructor( args, opts ) {
		super( args, opts );

		this.option( 'verbose', {
			name: 'verbose',
			alias: 'v',
			description: 'If set will produce more verbose logs'
		} );

		// #7
		this.option( 'dev', {
			name: 'dev',
			description: 'Whether to use editor in env CKEDITOR_DEV_PATH variable rather than cwd',
			default: false
		} );
	}

	/**
	 * @returns {Workspace} An instance describing CKEditor instance.
	 * @member IssueGenerator
	 */
	_getWorkspace() {
		if ( !this.workspace ) {
			this.workspace = this._createWorkspace( this.options.dev ? process.env.CKEDITOR_DEV_PATH : this.destinationPath() );
		}

		return this.workspace;
	}

	/**
	 * Returns a new workspace object for given Generator instance. Created for easier tests stubbing.
	 *
	 * @param {String} path Workspace path.
	 * @returns {Workspace}
	 */
	_createWorkspace( path ) {
		return new Workspace( path );
	}

	/**
	 * Logs a message that will only be displayed if the verbose flag was passed.
	 *
	 * @param {mixed} msg
	 * @memberOf GeneratorBase
	 */
	logVerbose( msg ) {
		if ( this.options.verbose ) {
			this.log( msg );
		}
	}
}

module.exports = GeneratorBase;