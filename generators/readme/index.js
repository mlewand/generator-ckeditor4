'use strict';

const GeneratorBase = require( '../../src/GeneratorBase' );

class ReadmeGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.argument( 'name', require( '../createPlugin/pluginNameArgument' ) );

		this.option( 'description', {
			description: 'Description of the plugin.',
			required: false,
			type: String
		} );
	}

	writing() {
		this.fs.copyTpl(
			this.templatePath( 'README.md' ),
			this.destinationPath( 'README.md' ),
			this.options
		);
	}
};

module.exports = ReadmeGenerator;
