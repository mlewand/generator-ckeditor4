
/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Definition for placeholder plugin dialog.
 *
 */

'use strict';

CKEDITOR.dialog.add( 'my-plugin', function( editor ) {
	var generalLabel = 'General';

	return {
		title: 'Dialog title',
		minWidth: 300,
		minHeight: 80,
		contents: [
			{
				id: 'info',
				label: generalLabel,
				title: generalLabel,
				elements: [
					// Dialog window UI elements.
					{
						id: 'name',
						type: 'text',
						style: 'width: 100%;',
						label: 'Awesome label',
						default: '',
						required: true,
						setup: function() {
							// Dialog was open.
						},
						commit: function( widget ) {
							// Dialog was accepted.
							console.log( 'Name was set to ' + this.getValue() );
						}
					}
				]
			}
		]
	};
} );