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

	default() {
		if ( !this.options.skipVscode ) {
			this.fs.extendJSON( this.destinationPath( 'package.json' ), {
				devDependencies: {
					"@types/ckeditor": "0.0.37"
				}
			} );

			// Still call npmInstall so there's guarantee it's gonna be ran.
			this.npmInstall( [ '@types/ckeditor' ], { 'save-dev': true } );
		}
	}
}

module.exports = CreatePluginGenerator;