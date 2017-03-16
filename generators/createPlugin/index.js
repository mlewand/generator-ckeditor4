const Generator = require( 'yeoman-generator' ),
	GeneratorBase = require( '../../src/GeneratorBase' )
	path = require( 'path' ),
	fsp = require( 'fs-promise' ),
	open = require( 'open' );

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

		this.option( 'open', {
			alias: 'o',
			description: 'If set will open plugin.js file in your default editor.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipTests', {
			description: 'If set to true no tests directory will be added.',
			type: Boolean,
			default: false
		} );
	}

	dispatch() {
		return this._createDirectory()
			.then( outputDirectory =>
				this._copyTpl( this.templatePath( 'plugin.js' ), path.join( outputDirectory, 'plugin.js' ) )
			)
			.then( () => {
				return new Promise( ( resolve, reject ) => {
					this._writeFiles( () => {
						this._open();
						resolve();
					} )
				} );
			} );
	}

	_open() {
		if ( this.options.open ) {
			open( path.join( this._getOutputDirectory(), 'plugin.js' ) );
		}
	}

	/**
	 * Add tests directory.
	 */
	tests() {
		if ( !this.options.skipTests ) {
			let testsPaths = this.templatePath( path.join( '..', 'templatesOptional', 'tests' ) );

			this._copyTpl( testsPaths, this._getOutputDirectory() );
		}
	}

	_createDirectory() {
		let dirName = this.options.name,
			dirPath = this._getOutputDirectory();

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

	/**
	 * Returns a full path to a directory, where plugin should be saved.
	 *
	 * The value is cached.
	 *
	 * @private
	 * @returns {String}
	 */
	_getOutputDirectory() {
		if ( this._outputDirectory ) {
			return this._outputDirectory;
		}

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

		this._outputDirectory = dirPath;
		return dirPath;
	}

	/**
	 * A wrapper around `this.fs.tplCopy` call. Make sure that a common set of
	 * ejs template variables are passed.
	 *
	 * @param {String} templatePath
	 * @param {String} outputPath
	 */
	_copyTpl( templatePath, outputPath ) {
		this.fs.copyTpl( templatePath, outputPath, {
			name: this.options.name,
			shortName: this.options.name
		} );
	}
}

module.exports = CreatePluginGenerator;