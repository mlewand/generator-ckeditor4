const Generator = require( 'yeoman-generator' ),
	path = require( 'path' ),
	fsp = require( 'fs-promise' );

class CreatePluginGenerator extends Generator {
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

		let dirName = this.options.name,
			dirPath = this.destinationPath( dirName );

		// check if dir exists;
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