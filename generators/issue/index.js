var Generator = require( 'yeoman-generator' ),
	open = require( 'open' );

class CKEditor4Generator extends Generator {
	constructor( args, opts ) {
		super( args, opts );

		var generator = this;

		this.argument( 'action', {
			required: true,
			description: 'action',
			type: ( val ) => {
				let allowedValues = [ 'add', 'open' ];

				if ( allowedValues.indexOf( val ) === -1 ) {
					throw new Error( `Invalid value ${val} for action argument. ` );
				}

				return val;
			}
		} );

		this.argument( 'ticketNumber', {
			required: false,
			description: 'Number of ticket to be viewed, it\'s required for open action',
			type: Number
		} );
	}

	dispatch() {
		let mapping = {
			'add': this._add,
			'open': this._open
		}

		if ( mapping[ this.options.action ] ) {
			mapping[ this.options.action ].call( this );
		}
	}

	_add() {
		open( 'https://dev.ckeditor.com/newticket' );
	}

	_open() {
		if ( !this.options.ticketNumber ) {
			throw new Error( `Invalid ticket number "${this.options.ticketNumber}" given.` );
		}

		open( `https://dev.ckeditor.com/ticket/${this.options.ticketNumber}` );
	}
}

module.exports = CKEditor4Generator;