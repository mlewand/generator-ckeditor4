var Workspace = require( './Workspace' ),
	Generator = require( 'yeoman-generator' );

/**
 * Abstract base class for generators.
 *
 * @class GeneratorBase
 * @extends {Generator}
 */
class GeneratorBase extends Generator {
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
}

module.exports = GeneratorBase;