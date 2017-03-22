const GeneratorBase = require( '../../src/GeneratorBase' )
	_ = require( 'lodash' );

class CreatePluginGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.option( 'vscode', {
			alias: 'vs',
			description: 'If set will include Visual Studio Code goodies, such as improved type hinting.',
			type: Boolean,
			default: true
		} );
	}

	writing() {
		let pkg = this.fs.readJSON( this.destinationPath( 'package.json' ), {} );

		_.extend( pkg, {
			devDependencies: {
				'@types/ckeditor': '^0.0.37'
			}
		} );

		this.fs.writeJSON( this.destinationPath( 'package.json' ), pkg );
	}
}

module.exports = CreatePluginGenerator;