
const path = require( 'path' ),
	yeomanTest = require( 'yeoman-test' ),
	testedModulePath = '../../../generators/createPluginButton/index',
	PluginButtonGenerator = require( testedModulePath ),
	contributions = require( '../../../src/contributions' );

describe( 'Plugin button generator', () => {
	after( () => contributions.reset() );

	it( 'saves graphic files', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.withArguments( [ 'my-plugin' ] )
			.then( function( dir ) {
				expect( path.join( dir, 'icons', 'my-plugin.png' ) ).to.be.a.file();
				expect( path.join( dir, 'icons', 'hidpi', 'my-plugin.png' ) ).to.be.a.file();
			} );
	} );

	it( 'adds plugin.js contribution', () => {
		return yeomanTest.run( path.join( path.resolve( __dirname ), testedModulePath, '..' ) )
			.withArguments( [ 'my-plugin' ] )
			.then( function( dir ) {
				expect( contributions.get().plugin.init[ 0 ] ).to.be.eql( "if ( editor.ui.addButton ) {\n\
	editor.ui.addButton( 'my-plugin', {\n\
		label: 'my-plugin',\n\
		command: 'my-plugin',\n\
		toolbar: 'insert'\n\
	} );\n\
}" );
				expect( contributions.get().plugin.properties.requires ).to.contain( 'toolbar' );
			} );
	} );
} );