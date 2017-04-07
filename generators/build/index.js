'use strict';

let GeneratorBase = require( '../../src/GeneratorBase' ),
	path = require( 'path' ),
	fs = require( 'fs' ),
	rimraf = require( 'rimraf' ),
	spawn = require( 'child_process' ).spawn,
	BuildInfo = require( '../../src/BuildInfo' );

class BuildGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.option( 'preset', {
			description: 'Preset name to be built, one of the following: basic, standard or full.',
			type: String,
			default: 'basic'
		} );

		this.option( 'all', {
			description: 'Whether to include other plugins / skins that are not a part of preset. However these plugins / skins ' +
				'won\'t be merged into main ckeditor.js file.',
			type: Boolean,
			default: false
		} );

		this.option( 'minify', {
			description: 'Whether js and css files should be minified.',
			type: Boolean,
			default: true
		} );

		this.option( 'outputDir', {
			description: 'Directory, where the build will be put.',
			type: String,
			default: './build'
		} );

		this.option( 'timestamp', {
			description: 'Unix time used for custom timestamp markers. Useful for repetitive builds.',
			type: Number,
			default: 0
		} );

		this.option( 'overwrite', {
			description: 'Whether to overwrite output directory if already exists.',
			type: Boolean,
			default: true
		} );
	}

	dispatch() {
		let that = this,
			outputDir = this.options.outputDir,
			overwrite = this.options.overwrite,
			preset = that.options.preset,
			generatorBasePath = path.join( __dirname, '..', '..' ),
			info = new BuildInfo( {
				jarPath: path.join( generatorBasePath, 'ckbuilder', '2.3.1', 'ckbuilder.jar' ),
				sourceDir: that._getWorkspace()._getDirectoryPath(),
				targetDir: outputDir,
				skip: !this.options.all,
				preset: preset,
				minify: this.options.minify,
				presetPath: path.join( generatorBasePath, 'presets', preset + '-build-config.js' ),
				zip: false,
				tar: false,
				overwrite: overwrite
			}, that._getWorkspace() ),
			missingPlugins;

		return new Promise( ( resolve, reject ) => {
			if ( !overwrite ) {
				fs.exists( outputDir, exists => {
					return exists ? resolve() : reject( new Error( `Output directory "${outputDir}" already exists.` ) );
				} );
			} else {
				resolve();
			}
		} )
			.then( () => {
				that._markStage( 'Checking preset plugins' );
				return that._checkPlugins( that._getWorkspace(), info );
			} )
			.then( _missingPlugins => {
				missingPlugins = _missingPlugins;

				if ( missingPlugins ) {
					that.logVerbose( `Found missing plugins: ${Object.keys( missingPlugins )}` );

					return that.prompt( [ {
						name: 'missingPlugins',
						message: 'There are some missing plugins, would you like us to download them for you?',
						type: 'confirm'
					} ] )
						.then( answers => {
							if ( !answers.missingPlugins ) {
								return new Promise( ( resolve, reject ) => {
									reject( new Error( 'Refused to install missing plugins.' ) );
								} );
							}
							return that._processMissingPlugins( missingPlugins );
						} );
				}
					// No plugins missing, we're good to go.
				return new Promise( resolve => {
					resolve( null );
				} );
			} )
			.then( () => {
				that._markStage( 'Ready to build' );

				return that._doBuild( info );
			} )
			.then( () => {
				that._markStage( 'Cleanup' );

				if ( missingPlugins ) {
					return Promise.all( Object.keys( missingPlugins ).map( name => that._removePlugin( name ) ) );
				}
			} );
	}

	_removePlugin( pluginName ) {
		this.logVerbose( `Removing extra plugin: ${pluginName}` );

		return new Promise( ( resolve, reject ) => {
			rimraf( path.join( this._getWorkspace().getPluginsPath(), pluginName ), error => {
				return error ? reject( error ) : resolve();
			} );
		} );
	}

	/**
	 * Performs a build for given BulidInfo.
	 *
	 * @param {BuildInfo} info
	 * @returns Promise
	 * @memberOf BuildGenerator
	 */
	_doBuild( info ) {
		// We'll put compiled files into a temp dir first, to avoid a situation where output directory is in CKEditor directory,
		// and builder includes built code which would lead to infinite process.
		let tmpOutputDir = fs.mkdtempSync( './../cke4build' ),
			outputDir = info.targetDir,
			preset = info.preset,
			that = this;

		return new Promise( ( resolve, reject ) => {
			// Path to generator's main dir, where presets, and jar file can be found.
			let errOutput = '',
				buildProcess;

			that._markStage( `Calling ckbuilder.jar to build ${preset} preset` );

			info.targetDir = tmpOutputDir;

			buildProcess = spawn( 'java', info.getArguments(), {
				env: {
					CKBUILDER_TIMESTAMP: this.options.timestamp !== 0 ? this.options.timestamp : undefined
				}
			} );

			info.targetDir = outputDir;

			buildProcess.stdout.on( 'data', data => that._onBuilderStdOut( String( data ) ) );
			buildProcess.stderr.on( 'data', data => {
				errOutput += data;
			} );
			buildProcess.on( 'error', ( error ) => {
				reject( error.toString() );
			} );
			buildProcess.on( 'close', code => {
				return code === 0 ? resolve() : reject( `Invalid code returned: ${code}\n\nStderr:\n${errOutput}` );
			} );
		} ).then( () => {
			that._markStage( `Moving temp build directory to ${outputDir}` );

			if ( info.overwrite && fs.existsSync( outputDir ) ) {
				rimraf.sync( outputDir );
			}

			fs.renameSync( tmpOutputDir, outputDir );
			that._markStage( 'Done!' );
		} )['catch']( ( error ) => {
			that._markStage( 'Error occurred, removing temp directory.' );
			that.log( error );
			rimraf.sync( tmpOutputDir );
		} );
	}

	/**
	 * Clones a plugin from external git repository.
	 *
	 *		this._cloneExternalPlugin( 'https://github.com/WebSpellChecker/ckeditor-plugin-wsc.git#b67a28e0f89d9b2bbc6c9e22355e7da7d3fa0edd', 'wsc' );
	 *
	 * @param {String} url URL git repository.
	 * @param {String} name Plugin name.
	 * @returns Promise
	 * @memberOf BuildGenerator
	 */
	_cloneExternalPlugin( url, name ) {
		let gitClone = require( 'git-clone' ),
			gitUrlParse = require( 'git-url-parse' ),
			parsedUrl = gitUrlParse( url ),
			hash = parsedUrl.hash || undefined,
			that = this;

		return new Promise( ( resolve, reject ) => {
			let targetPath = path.join( this._getWorkspace().getPluginsPath(), name );
			that.logVerbose( `Cloning ${parsedUrl.toString()} to ${targetPath} directory` );


			gitClone( parsedUrl.toString(), targetPath, {
				checkout: hash
			}, ( err ) => {
				return err ? reject( err ) : resolve();
			} );
		} );
	}

	_processMissingPlugins( missingPlugins ) {
		let _ = require( 'lodash' );
		this._markStage( 'Processing missing plugins' );
		return Promise.all( _.toPairs( missingPlugins ).map( pair => this._processSinglePlugin( pair[ 0 ], pair[ 1 ] ) ) );
	}


	/**
	 * @param {String} name Plugin name.
	 * @param {any} value Value assigned in preset config. Most of the times it's simply `1` or a git repo URL string.
	 * @returns Promise
	 * @memberOf BuildGenerator
	 */
	_processSinglePlugin( name, value ) {
		if ( typeof value === 'string' ) {
			this.logVerbose( `${name} is a git URL` );
			return this._cloneExternalPlugin( value, name );
		}
		return new Promise( ( resolve, reject ) => {
			reject( new Error( `No handling for value ${value} yet - plugin ${name}` ) );
		} );
	}

	/**
	 * Checks if workspace plugin contains all the plugins, required in build info. If it doesn't it returns object with missing plugins, as
	 * it may happen that build info adds some external plugins.
	 *
	 *		console.log( this._checkPlugins( workspace, info ) );
	 *		// Logs: { scayt: 'https://github.com/WebSpellChecker/ckeditor-plugin-scayt.git#c1f60eaffea7a3078517ddc918d7ebc9bcf1aded', scayt: 1 }
	 *
	 * @param {Workspace} workspace
	 * @param {BuildInfo} info
	 * @returns Promise<Object/null> Object enumerating missing plugins, or `null` if all plugins are available.
	 * @memberOf BuildGenerator
	 */
	_checkPlugins( workspace, info ) {
		return Promise.all( [ workspace.getPlugins(), info.getPlugins() ] )
			.then( ( results ) => {
				let [ workspacePlugins, buildInfoPlugins ] = results,
					_ = require( 'lodash' ),
					ret;

				ret = _.keys( buildInfoPlugins ).filter( name => workspacePlugins.indexOf( name ) === -1 )
					.map( name => [ name, buildInfoPlugins[ name ] ] );

				ret = _.fromPairs( ret );

				return _.isEmpty( ret ) ? null : ret;
			} );
	}

	/**
	 * @param {String} msg
	 * @memberOf BuildGenerator
	 */
	_onBuilderStdOut( msg ) {
		this.log( msg );
	}

	/**
	 * Logs a visible information about entering into a next stage of building process.
	 *
	 * @param {String} description
	 * @memberOf BuildGenerator
	 */
	_markStage( description ) {
		this.log( '--- ' + description + ' ---' );
	}
}

module.exports = BuildGenerator;