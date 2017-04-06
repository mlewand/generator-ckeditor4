const Generator = require( 'yeoman-generator' ),
	GeneratorBase = require( '../../src/GeneratorBase' )
	contributions = require( '../../src/contributions' )
	path = require( 'path' ),
	fsp = require( 'fs-promise' ),
	open = require( 'open' ),
	_ = require( 'lodash' );

class CreatePluginGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.argument( 'name', require( './pluginNameArgument' ) );

		this.option( 'open', {
			alias: 'o',
			description: 'If set will open plugin.js file in your default editor.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipTests', {
			description: 'If set, no tests directory will be added.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipSamples', {
			description: 'If set, no samples will be added.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipLang', {
			description: 'If set, no language file will be created.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipIcon', {
			description: 'If set, no icon will be created.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipPackage', {
			description: 'If set, no package.json will be generated.',
			type: Boolean,
			default: false
		} );

		this.option( 'skipReadme', {
			description: 'If set, no README.md will be generated.',
			type: Boolean,
			default: false
		} );

		this.option( 'dialog', {
			alias: 'd',
			description: 'If set, a simple dialog will be added.',
			type: Boolean,
			default: false
		} );

		this.option( 'button', {
			description: 'If set will include a button to the toolbar.',
			type: Boolean,
			default: false
		} );

		contributions.add( {
			plugin: {
				properties: {
					requires: []
				},
				init: []
			},

			fs: []
		} );

		this._contribs = contributions.get();

		const beautify = require( 'gulp-beautify' ),
			gulpIf = require( 'gulp-if' );

		this.registerTransformStream( [
			this._cleanupTransformStream(),
			gulpIf( function( file ) {
				return file.extname.toLowerCase() === '.js';
			}, beautify( {
				indent_with_tabs: true,
				space_in_paren: true,
				space_in_empty_paren: false,
				space_after_anon_function: false
			} ) )
		] );

		let optionsWithArguments = _.extend( {}, this.options, {
			arguments: [ this.options.name ]
		} );

		this.composeWith( require.resolve( './../createPluginVscode' ), this.options );

		if ( this.options.button ) {
			this.composeWith( require.resolve( './../createPluginButton' ), optionsWithArguments );
		}

		if ( !this.options.skipReadme ) {
			this.composeWith( require.resolve( './../readme' ), optionsWithArguments );
		}

		if ( !this.options.skipPackage ) {
			this.composeWith( require.resolve( './../package' ), optionsWithArguments );
		}
	}

	initializing() {
		const desiredDirectory = this._getOutputDirectory();

		return this._createDirectory( this.options.name, desiredDirectory )
			.then( () => this.destinationRoot( desiredDirectory ) );
	}

	dispatch() {
		this._dialog();
		this._lang();
		this._icon();
	}

	writing() {
		if ( !this.options.skipTests ) {
			this.fs.extendJSON( this.destinationPath( 'package.json' ), {
				scripts: {
					'test': 'node ./node_modules/benderjs-cli/bin/bender run chrome',
					'test-server': 'node ./node_modules/benderjs-cli/bin/bender server run'
				},
				devDependencies: {
					benderjs: '^0.4.1',
					'benderjs-cli': '^0.1.1',
					'benderjs-coverage': '^0.2.1',
					'benderjs-yui': '^0.3.3',
					'ckeditor-dev': '^4.6.2',
					'eslint-config-ckeditor4': '^1.0.0',
					'resolve-pkg': '^1.0.0'
				}
			} );

			this.npmInstall( [
				'benderjs',
				'benderjs-cli',
				'benderjs-coverage',
				'benderjs-yui',
				'resolve-pkg'
			], { 'save-dev': true } );
		}

		this._copyTpl( this.templatePath( 'plugin.js' ), this.destinationPath( 'plugin.js' ), 'plugin' )
		this._writeFsContribs();
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

			this._copyTpl( testsPaths, this.destinationPath() );
		}
	}

	/**
	 * Add tests directory.
	 */
	samples() {
		if ( !this.options.skipSamples ) {
			this._copyTpl( this.templatePath( path.join( '..', 'templatesOptional', 'samples' ) ), this.destinationPath() );
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
				this.destinationPath() + path.sep + path.join( 'dialogs', dialogName + '.js' )
			] );
		}
	}

	_lang() {
		if ( !this.options.skipLang ) {
			this._contribs.plugin.properties.lang = 'en';

			this._contribs.fs.push( [
				this.templatePath( path.join( '..', 'templatesOptional', 'lang', 'lang', 'en.js' ) ),
				this.destinationPath() + path.sep + path.join( 'lang', 'en.js' )
			] );
		}
	}

	_icon() {
		if ( !this.options.skipIcon ) {
			const name = this.options.name;

			this._contribs.plugin.properties.icons = name;
			this._contribs.plugin.properties.hidpi = true;

			this._contribs.fs.push( [
				this.templatePath( path.join( '..', 'templatesOptional', 'icon', 'icons', `boilerplate.png` ) ),
				this.destinationPath() + path.sep + path.join( 'icons', `${name}.png` )
			], [
				this.templatePath( path.join( '..', 'templatesOptional', 'icon', 'icons', 'hidpi', `boilerplate.png` ) ),
				this.destinationPath() + path.sep + path.join( 'icons', 'hidpi', `${name}.png` )
			] );
		}
	}

	_open() {
		if ( this.options.open ) {
			open( path.join( this.destinationPath(), 'plugin.js' ) );
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

	_createDirectory( dirName, dirPath ) {
		// let dirPath = this.destinationPath( dirName );

		// Check if dir exists:
		return fsp.exists( dirPath )
			.then( exists => {
				if ( exists ) {
					throw new Error( `Directory "${dirName}" already exists.` );
				}

				return fsp.mkdir( dirPath )
					.then( () => dirPath );
			} );
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
		let workspace = null,
			dirName = this.options.name;

		try {
			workspace = this._getWorkspace();
		} catch ( e ) {
			if ( !e.message.startsWith( "Sorry, can't locate CKEditor 4 in " ) ) {
				throw e;
			}
		}

		return workspace ?
			path.join( workspace.getPluginsPath(), dirName ) :
			this.destinationPath( dirName );
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
		// The whole contribution model was experimentally introduced in #19. More commments on this
		// in the ticket.
		let ret = this._contribs[ contributableName ];

		if ( contributableName == 'plugin' ) {
			// requires:
			if ( ret.properties.requires && ret.properties.requires.length !== 0 ) {
				ret.properties.requires = ret.properties.requires.join( ',' );
			} else {
				delete ret.properties.requires;
			}

			if ( ret.properties && Object.keys( ret.properties ).length ) {
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