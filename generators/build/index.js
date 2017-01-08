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
		} )
	}

	dispatch() {
		let that = this,
			// We'll put compiled files into a temp dir first, to avoid a situation where output directory is in CKEditor directory,
			// and builder includes built code which would lead to infinite process.
			tmpOutputDir = fs.mkdtempSync( './../cke4build' ),
			outputDir = './build',
			overwrite = true;

		return new Promise( ( resolve, reject ) => {
				if ( fs.existsSync( outputDir ) && !overwrite ) {
					reject( `Output directory "${outputDir}" already exists.` );
				}

				// Path to generator's main dir, where presets, and jar file can be found.
				let preset = that.options.preset,
					generatorBasePath = path.join( __dirname, '..', '..' ),
					info = new BuildInfo( {
						jarPath: path.join( generatorBasePath, 'ckbuilder', '2.3.1', 'ckbuilder.jar' ),
						sourceDir: that._getWorkspace()._getDirectoryPath(),
						targetDir: tmpOutputDir,
						skip: !this.options.all,
						preset: preset,
						presetPath: path.join( generatorBasePath, 'presets', preset + '-build-config.js' ),
						zip: false,
						tar: false,
						overwrite: true
					}, that._getWorkspace() ),
					output = '',
					errOutput = '',
					buildProcess;

				that._markStage( `Calling ckbuilder.jar to build ${preset} preset` );

				buildProcess = spawn( 'java', info.getArguments() );

				buildProcess.stdout.on( 'data', data => that._onBuilderStdOut( String( data ) ) );
				buildProcess.stderr.on( 'data', data => { errOutput += data; } );
				buildProcess.on( 'error', ( error ) => {
					reject( error.toString() );
				} );
				buildProcess.on( 'close', code => {
					code === 0 ? resolve() : reject( `Invalid code returned: ${code}\n\nStderr:\n${errOutput}` );
				} );

			} ).then( () => {
				that._markStage( `Moving temp build directory to ${outputDir}` );

				if ( overwrite && fs.existsSync( outputDir ) ) {
					rimraf.sync( outputDir );
				}

				fs.renameSync( tmpOutputDir, outputDir );
				that._markStage( 'Done!' );
			} ).catch( ( error ) => {
				that._markStage( 'Error occurred, removing temp directory.' );
				that.log( error );
				rimraf.sync( tmpOutputDir );
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