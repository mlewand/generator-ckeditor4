/**
 * A class describing CKEditor 4 workspace.
 *
 * It can answer things like:
 * * What it the path to default plugins directory?
 * * What branch is currently used?
 * * What CKEditor version is it?
 *
 * @class Workspace
 */
class Workspace {

	/**
	 *
	 * @param {any} generator Yoeman generator instance.
	 * @memberOf Workspace
	 */
	constructor( generator ) {
		this.generator = generator;
	}

	/**
	 * @returns {String/null} Current branch name or null if can't be told.
	 * @memberOf Workspace
	 */
	getBranch() {
		let gitRevSync = require( 'git-rev-sync' );

		return gitRevSync.branch( this.generator.destinationPath() );
	}

	/**
	 * This method relies on our workflow, where we set `t/<ticketNumber>`, e.g. `t/12345` as our branch name.
	 *
	 * @returns {Number/null} Returns ticket number that's currently worked on, or `null`.
	 * @memberOf Workspace
	 */
	getTicketNumber() {
		let branch = this.getBranch();

		return branch.startsWith( 't/' ) ? parseInt( branch.substr( 2 ) ) : null;
	}
}

module.exports = Workspace;