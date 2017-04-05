/* jshint browser: false, node: true */

'use strict';

var resolvePkg = require( 'resolve-pkg' ),
	path = require( 'path' ),
	ckeditorDevPath = resolvePkg( 'ckeditor-dev' ),
	ckeditorDevPathRelative = path.relative( __dirname, ckeditorDevPath ).replace( /\\/g, '/' );

var config = {
	applications: {
		ckeditor: {
			path: ckeditorDevPathRelative,
			files: [
				'ckeditor.js'
			]
		},
		plugin: {
			path: '.',
			files: [
				'plugin.js'
			]
		}
	},

	framework: 'yui',

	coverage: {
		paths: [
			'plugin.js'
		],
		options: {
			checkTrackerVar: true
		}
	},

	plugins: [
		'benderjs-coverage',
		'benderjs-yui',
		ckeditorDevPathRelative + '/tests/_benderjs/ckeditor'
	],

	tests: {
		'<%= shortName %>': {
			applications: [ 'ckeditor' ],
			basePath: '.',
			paths: [
				'tests/**',
				'!**/_*/**'
			]
		}
	}
};

module.exports = config;