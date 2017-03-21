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

		this.option( 'skipSamples', {
			description: 'If set to true no samples will be added.',
			type: Boolean,
			default: false
		} );

		this.option( 'dialog', {
			alias: 'd',
			description: 'If set to true, a simple dialog will be added.',
			type: Boolean,
			default: false
		} );

		this._contribs = {
			plugin: {
				properties: {
					requires: []
				},
				init: []
			},

			fs: []
		};

		this.registerTransformStream( this._cleanupTransformStream() );
	}

	dispatch() {
		return this._createDirectory()
			.then( outputDirectory => {
				this._dialog();

				return outputDirectory;
			} )
			.then( outputDirectory =>
				this._copyTpl( this.templatePath( 'plugin.js' ), path.join( outputDirectory, 'plugin.js' ), 'plugin' )
			)
			.then( () => this._writeFsContribs );
	}

	end() {
		// Files needs to be written before calling open, as otherwise file doesn't exists yet.
		this._open();
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

	/**
	 * Add tests directory.
	 */
	samples() {
		if ( !this.options.skipSamples ) {
			this._copyTpl( this.templatePath( path.join( '..', 'templatesOptional', 'samples' ) ), this._getOutputDirectory() );
		}
	}

	/**
	 * Adds a transformation stream handler that will remove empty comment lines,
	 * hanging after contributions inline.
	 *
	 * @private
	 */
	_cleanupTransformStream() {
		const through = require( 'through2' ),
			// Remove only with tailing whitespace, that will tell the difference
			// from regular comments, as these have tailing spaces stripped.
			commentRegexp = /^\s*\/\/\s+\n/gm;

		// @todo: Add code formatting step.

		return through.obj( function( file, encoding, callback ) {
			if ( file.extname === '.js' && file.isBuffer() ) {
				file.contents = Buffer.from( file.contents.toString( 'utf8' ).replace( commentRegexp, '' ), 'utf8' );
			}

			callback( null, file );
		} );
	}


	_dialog() {
		if ( this.options.dialog ) {
			let pluginContribs = this._contribs.plugin,
				dialogName = this.options.name;

			pluginContribs.properties.requires.push( 'dialog' );

			pluginContribs.init.push( `CKEDITOR.dialog.add( '${dialogName}', this.path + 'dialogs/${dialogName}.js' );` );
			pluginContribs.init.push( `editor.addCommand( '${dialogName}', new CKEDITOR.dialogCommand( '${dialogName}' ) );` );

			// dialog file...
			this._contribs.fs.push( [
				this.templatePath( path.join( '..', 'templatesOptional', 'dialog', 'dialogs', 'boilerplate.js' ) ),
				this._getOutputDirectory() + path.sep + path.join( 'dialogs', dialogName + '.js' )
			] );
		}
	}

	_open() {
		if ( this.options.open ) {
			open( path.join( this._getOutputDirectory(), 'plugin.js' ) );
		}
	}

	_writeFsContribs() {
		let fsContribs = this._contribs.fs;

		if ( fsContribs.length ) {
			fsContribs.forEach( ( vals ) => {
				this._copyTpl( vals[ 0 ], vals[ 1 ] );
			} );
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
	_copyTpl( templatePath, outputPath, contributableName ) {
		this.fs.copyTpl( templatePath, outputPath, this._getTemplateVars( contributableName ) );
	}

	/**
	 * @returns {Object} Returns an variable object passed to the ejs templates.
	 */
	_getTemplateVars( contributableName ) {
		let ret = {
			name: this.options.name,
			shortName: this.options.name,
			year: ( new Date() ).getFullYear()
		};

		if ( this._contribs[ contributableName ] ) {
			ret[ contributableName ] = this._processContribs( contributableName );
		}

		return ret;
	}

	_processContribs( contributableName ) {
		let ret = this._contribs[ contributableName ];

		if ( contributableName == 'plugin' ) {
			// requires:
			if ( ret.properties.requires && ret.properties.requires.length !== 0 ) {
				ret.properties.requires = ret.properties.requires.join( ',' );
			} else {
				delete ret.properties.requires;
			}

			if ( ret.properties && ret.properties.length ) {
				ret.properties = '\n' + JSON.stringify( ret.properties ).slice( 1, -1 ) + ',';
			} else {
				ret.properties = '';
			}

			// init:
			if ( ret.init && ret.init.length !== 0 ) {
				ret.init = '\n' + ret.init.join( '\n' );
			} else {
				delete ret.init;
			}
		}

		return ret;
	}
}

module.exports = CreatePluginGenerator;