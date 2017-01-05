var Workspace = require( '../../src/Workspace' ),
	Generator = require( 'yeoman-generator' ),
	open = require( 'open' );

class CKEditor4Generator extends Generator {
	constructor( args, opts ) {
		super( args, opts );

		this.argument( 'action', {
			required: true,
			description: 'Action type, one of the following: add, open, roadmap, milestone.',
			type: ( val ) => {
				let allowedValues = [ 'add', 'open', 'roadmap', 'milestone' ];

				if ( allowedValues.indexOf( val ) === -1 ) {
					throw new Error( `Invalid value ${val} for action argument.` );
				}

				return val;
			}
		} );

		this.argument( 'arg1', {
			required: false,
			description: 'For open action: Number of ticket to be viewed. If skipped will try to guess based on branch name.\n' +
				'\tFor milestone action: milestone number to be viewed, e.g. "4.6.0". If skipped uses current version.'
		} );
	}

	dispatch() {
		let mapping = {
			'add': this._add,
			'open': this._open,
			'roadmap': this._roadmap,
			'milestone': this._milestone
		};

		if ( mapping[ this.options.action ] ) {
			mapping[ this.options.action ].call( this );
		}
	}

	_add() {
		open( 'https://dev.ckeditor.com/newticket' );
	}

	_open() {
		let ticketNumber = this.options.arg1;

		if ( ticketNumber === undefined ) {
			ticketNumber = this._getWorkspace().getTicketNumber();
		}

		if ( !ticketNumber ) {
			throw new Error( `Invalid ticket number "${ticketNumber}" given.` );
		}

		open( `https://dev.ckeditor.com/ticket/${ticketNumber}` );
	}

	_roadmap() {
		open( 'https://dev.ckeditor.com/roadmap' );
	}

	_milestone() {
		let version = this.options.arg1;

		if ( version === undefined ) {
			version = this._getWorkspace().getVersion();
		}

		if ( !String( version ).match( /^\d+\.\d+\.\d+$/ ) ) {
			throw new Error( `Invalid version "${version}" given.` );
		}

		open( `http://dev.ckeditor.com/milestone/CKEditor%20${version}` );
	}

	/**
	 * @returns {Workspace} An instance describing CKEditor instance.
	 * @member CKEditor4Generator
	 */
	_getWorkspace() {
		if ( !this.workspace ) {
			this.workspace = new Workspace( this );
		}

		return this.workspace;
	}
}

module.exports = CKEditor4Generator;