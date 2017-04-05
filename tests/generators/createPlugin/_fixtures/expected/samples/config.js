CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	// %REMOVE_START%
	config.plugins =
		'about,' +
		'a11yhelp,' +
		'basicstyles,' +
		'clipboard,' +
		'colorbutton,' +
		'contextmenu,' +
		'dialogadvtab,' +
		'elementspath,' +
		'enterkey,' +
		'floatingspace,' +
		'font,' +
		'format,' +
		'htmlwriter,' +
		'image,' +
		'indentlist,' +
		'indentblock,' +
		'justify,' +
		'link,' +
		'list,' +
		'liststyle,' +
		'magicline,' +
		'maximize,' +
		'newpage,' +
		'pastefromword,' +
		'pastetext,' +
		'preview,' +
		'removeformat,' +
		'resize,' +
		'selectall,' +
		'showblocks,' +
		'showborders,' +
		'sourcearea,' +
		'stylescombo,' +
		'tab,' +
		'table,' +
		'tabletools,' +
		'toolbar,' +
		'undo,' +
		'wysiwygarea';
	// %REMOVE_END%

	// To add any external plugin just use:
	// CKEDITOR.plugins.addExternal( 'customplugin', '../plugins/customplugin/plugin.js' );
	// config.plugins += ',customplugin';


	CKEDITOR.plugins.addExternal( 'foo', location.href.replace( '/index.html', '' ) + '/../plugin.js' );
	config.plugins += ',foo';
};