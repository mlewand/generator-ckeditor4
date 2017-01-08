
const PRESET_DEFAULT = 'basic';

class BuildInfo {
	constructor( info, workspace ) {
		info = info || {};

		this.preset = info.preset || PRESET_DEFAULT;

		this.presetPath = info.presetPath;

		this.sourceDir = info.sourceDir;

		this.targetDir = info.targetDir;

		this.jarPath = info.jarPath;

		this.workspace = workspace;

		/**
		 * Whether zip archive should be created.
		 *
		 * @property {Boolean} [zip=true]
		 */
		this.zip = info.zip !== undefined ? Boolean( info.zip ) : true;

		/**
		 * Whether tar archive should be created.
		 *
		 * @property {Boolean} [tar=true]
		 */
		this.tar = info.tar !== undefined ? Boolean( info.tar ) : true;

		/**
		 * Whether plugins and skins not required by given preset, but available in source, should be included into the distribution. With
		 * `skip` set to `false` you'll create so called full distribution.
		 *
		 * @property {Boolean} [tar=false]
		 */
		this.skip = Boolean( info.skip );

		/**
		 * Whether target directory should be overridden if exists.
		 *
		 * @property {Boolean}
		 */
		this.overwrite = Boolean( info.overwrite );
	}

	/**
	 * Returns this object serialized as ckbuilder.jar friendly arguments array.
	 *
	 * @returns {String[]}
	 * @memberOf BuildInfo
	 */
	getArguments() {
		let ret = [
				'-jar', this.jarPath,
				'--build', this.sourceDir,
				this.targetDir,
				'--version', `${this.workspace.getVersion()} (${this.preset})`,
				'--revision', this.workspace.getRevision(),
				'--build-config', this.presetPath
			],
			optionalArgs = {
				'--overwrite': this.overwrite === true,
				'--no-zip': this.zip === false,
				'--no-tar': this.tar === false,
				'-s': this.skip
			};

		for ( let argName in optionalArgs ) {
			if ( optionalArgs[ argName ] === true ) {
				ret.push( argName );
			}
		}

		return ret;
	}
}

module.exports = BuildInfo;