let GeneratorBase = require( '../../src/GeneratorBase' ),
	path = require( 'path' ),
	fs = require( 'fs' ),
	spawn = require( 'child_process' ).spawn,
	BuildInfo = require( '../../src/BuildInfo' );

class BuildGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );
	}

	dispatch() {
		let that = this,
			// We'll put compiled files into a temp dir first, to avoid a situation where output directory is in CKEditor directory,
			// and builder includes built code which would lead to infinite process.
			tmpOutputDir = fs.mkdtempSync( './../cke4build' ),
			outputDir = './build';

		return new Promise( ( resolve, reject ) => {
				// Path to generator's main dir, where presets, and jar file can be found.
				let preset = 'basic',
					generatorBasePath = path.join( __dirname, '..', '..' ),
					info = new BuildInfo( {
						jarPath: path.join( generatorBasePath, 'ckbuilder', '2.3.1', 'ckbuilder.jar' ),
						sourceDir: that._getWorkspace()._getDirectoryPath(),
						targetDir: tmpOutputDir,
						skip: true,
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
				fs.renameSync( tmpOutputDir, outputDir );
				that._markStage( 'Done!' );
			} ).catch( ( error ) => {
				that._markStage( 'Error occurred, removing temp directory.' );
				that.log( error );
				fs.rmdirSync( tmpOutputDir );
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