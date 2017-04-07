'use strict';

const GeneratorBase = require( '../../src/GeneratorBase' );

// This generator creates a package.json file.
class PackageGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.argument( 'name', require( '../createPlugin/pluginNameArgument' ) );

		this.option( 'author', {
			description: 'Author of the plugin. This will be used for package.json.',
			required: false,
			type: String
		} );

		this.option( 'description', {
			description: 'Description of the plugin. This will be used for package.json.',
			required: false,
			type: String
		} );
	}

	prompting() {
		var prompts = [ {
			name: 'description',
			message: 'Description',
			when: !this.options.description
		}, {
			name: 'author',
			message: 'Author',
			when: !this.options.author,
			store: true
		} ];

		return this.prompt( prompts )
			.then( answers => {
				for ( let key in answers ) {
					this.options[ key ] = answers[ key ] || this.options[ key ];
				}
			} );
	}

	writing() {
		var pkg = {
				name: `ckeditor-plugin-${this.options.name}`,
				version: '0.0.0',
				description: this.options.description,
				author: this.options.author,
				main: 'plugin.js',
				keywords: [
					'ckeditor4',
					'plugin',
					'boilerplate'
				],
				dependencies: {},
				devDependencies: {}
			},
			outPath = this.destinationPath( 'package.json' );

		this.npmInstall( [ 'ckeditor-dev', 'eslint-config-ckeditor4' ], { 'save-dev': true } );

		if ( this.fs.exists( outPath ) ) {
			this.fs.extendJSON( outPath, pkg );
		} else {
			this.fs.writeJSON( outPath, pkg );
		}
	}
}

module.exports = PackageGenerator;