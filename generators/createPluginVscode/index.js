const GeneratorBase = require( '../../src/GeneratorBase' ),
	_ = require( 'lodash' );

class CreatePluginGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.option( 'skipVscode', {
			alias: 'no-vs',
			description: 'If set will include Visual Studio Code goodies, such as improved type hinting.',
			type: Boolean,
			default: false
		} );
	}

	writing() {
		if ( !this.options.skipVscode ) {
			if ( !this.fs.exists( 'package.json' ) ) {
				// Make sure that package.json exists, so that devDeps are saved.
				this.fs.writeJSON( this.destinationPath( 'package.json' ), {} );
			}

			this.npmInstall( [ '@types/ckeditor' ], { 'save-dev': true } );
		}
	}
}

module.exports = CreatePluginGenerator;