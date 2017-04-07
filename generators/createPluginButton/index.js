'use strict';

const GeneratorBase = require( '../../src/GeneratorBase' ),
	contributions = require( '../../src/contributions' );

class CreatePluginButtonGenerator extends GeneratorBase {
	constructor( args, opts ) {
		super( args, opts );

		this.argument( 'name', require( '../createPlugin/pluginNameArgument' ) );
	}

	default() {
		contributions.add( {
			plugin: {
				properties: {
					requires: [],
					icons: this.options.name,
					hidpi: true
				},
				init: []
			},
		} );

		contributions.get().plugin.properties.requires.push( 'toolbar' );
		contributions.get().plugin.init.push( `if ( editor.ui.addButton ) {
	editor.ui.addButton( '${this.options.name}', {
		label: '${this.options.name}',
		command: '${this.options.name}',
		toolbar: 'insert'
	} );
}` );
	}

	writing() {
		this.fs.copy( this.templatePath( 'icons', 'button.png' ), this.destinationPath( 'icons', this.options.name + '.png' ) );
		this.fs.copy( this.templatePath( 'icons', 'hidpi', 'button.png' ), this.destinationPath( 'icons', 'hidpi', this.options.name + '.png' ) );
	}
}

module.exports = CreatePluginButtonGenerator;