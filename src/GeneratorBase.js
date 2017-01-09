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
	}

	/**
	 * @returns {Workspace} An instance describing CKEditor instance.
	 * @member IssueGenerator
	 */
	_getWorkspace() {
		if ( !this.workspace ) {
			this.workspace = new Workspace( this );
		}

		return this.workspace;
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