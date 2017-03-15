const Generator = require( 'yeoman-generator' ),
	GeneratorBase = require( '../../src/GeneratorBase' )
	path = require( 'path' ),
	fsp = require( 'fs-promise' );

class CreatePluginGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.argument( 'name', {
			required: true,
			description: 'Name of the plugin.',
			type: function( val ) {
				val = String( val );
				let allowedRegexp = /^[a-z0-9\-_]+$/i;

				if ( !val.match( allowedRegexp ) ) {
					throw new Error( `Plugin name, "${val}" doesn't match allowed name regexp: ${allowedRegexp}.` );
				}

				return val;
			}
		} );
	}

	dispatch() {
		return this._createDirectory()
			.then( outputDirectory => {
				this.fs.copyTpl(
					this.templatePath( 'plugin.js' ),
					path.join( outputDirectory, 'plugin.js' ),
					{
						name: this.options.name
					}
				);
			} );
	}

	_createDirectory() {
		let workspace = null;

		try {
			workspace = this._getWorkspace();
		} catch ( e ) {
			if ( !e.message.startsWith( "Sorry, can't locate CKEditor 4 in " ) ) {
				throw e;
			}
		}

		let dirName = this.options.name,
			dirPath = workspace ?
				path.join( workspace.getPluginsPath(), dirName ) :
				this.destinationPath( dirName );

		// Check if dir exists:
		return fsp.exists( dirPath )
			.then( exists => {
				if ( exists ) {
					throw new Error( `Directory "${dirName}" already exists.` );
				}

				return fsp.mkdir( dirPath );
			} )
			.then( () => dirPath );
	}
}

module.exports = CreatePluginGenerator;