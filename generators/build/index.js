let GeneratorBase = require( '../../src/GeneratorBase' ),
	path = require( 'path' ),
	fs = require( 'fs' ),
	spawn = require( 'child_process' ).spawn;

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
			// outputDir = './../cke-build';

		return new Promise( ( resolve, reject ) => {
				// Path to generator's main dir, where presets, and jar file can be found.
				let generatorBasePath = path.join( __dirname, '..', '..' ),
					jarPath = path.join( generatorBasePath, 'ckbuilder', '2.3.1', 'ckbuilder.jar' ),
					skip = '-s', // Skip plugins not required by the preset.
					preset = 'basic',
					presetConfigPath = path.join( generatorBasePath, 'presets', 'basic-build-config.js' );

				let output = '',
					errOutput = '',
					_args = [
						'-jar', jarPath,
						'--build', that._getWorkspace()._getDirectoryPath(),
						tmpOutputDir,
						skip,
						'--version', `${that._getWorkspace().getVersion()} (${preset})`,
						'--revision', that._getWorkspace().getRevision(),
						'--build-config', presetConfigPath,
						'--overwrite',
						'--no-zip',
						'--no-tar'
					],
					buildProcess;

				that._markStage( `Calling ckbuilder.jar to build ${preset} preset` );
				buildProcess = spawn( 'java', _args );

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
			} ).catch( ( error ) => {
				that._markStage( 'Error occurred, removing temp directory.' );
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