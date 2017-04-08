CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	// %REMOVE_START%
	config.plugins =
		'about,' +
		'basicstyles,' +
		'clipboard,' +
		'elementspath,' +
		'enterkey,' +
		'floatingspace,' +
		'htmlwriter,' +
		'removeformat,' +
		'sourcearea,' +
		'tab,' +
		'toolbar,' +
		'undo,' +
		'wysiwygarea,' +
		'<%= shortName %>';
	// %REMOVE_END%

	config.toolbarGroups = [
		{ name: 'document', groups: [ 'mode' ] },
		{ name: 'insert' },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] }
	];

	config.removeButtons = 'Underline,Superscript,Subscript';

	config.extraAllowedContent = 'h1';

	// Plugin location needs to be explicitly provided as it's loaded from outside of CKEditor location.
	CKEDITOR.plugins.addExternal( '<%= shortName %>', location.href.replace( '/index.html', '' ) + '/../plugin.js' );
};