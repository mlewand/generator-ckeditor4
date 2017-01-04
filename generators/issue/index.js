var Workspace = require( '../../src/Workspace' ),
	Generator = require( 'yeoman-generator' ),
	open = require( 'open' );

class CKEditor4Generator extends Generator {
	constructor( args, opts ) {
		super( args, opts );

		var generator = this;

		this.argument( 'action', {
			required: true,
			description: 'Action type, one of the following: add, open.',
			type: ( val ) => {
				let allowedValues = [ 'add', 'open' ];

				if ( allowedValues.indexOf( val ) === -1 ) {
					throw new Error( `Invalid value ${val} for action argument.` );
				}

				return val;
			}
		} );

		this.argument( 'ticketNumber', {
			required: false,
			description: 'Number of ticket to be viewed, it\'s used in "open" action. If skipped will try to guess based on branch name.',
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
		let ticketNumber = this.options.ticketNumber;

		if ( ticketNumber === undefined ) {
			let ckeWorkspace = new Workspace( this );
			ticketNumber = ckeWorkspace.getTicketNumber();
		}

		if ( !ticketNumber ) {
			throw new Error( `Invalid ticket number "${ticketNumber}" given.` );
		}

		open( `https://dev.ckeditor.com/ticket/${ticketNumber}` );
	}
}

module.exports = CKEditor4Generator;