var Generator = require('yeoman-generator');

class CKEditor4Generator extends Generator {
	constructor( args, opts ) {
		super( args, opts );
	}

	method1() {
		console.log( 'method 1 just ran' );
	}

	method2() {
		console.log( 'method 2 just ran' );
	}
}

module.exports = CKEditor4Generator;