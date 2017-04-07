'use strict';

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
		 * Whether to minify js and css files.
		 *
		 * @property {Boolean} [minify=true]
		 */
		this.minify = info.minify !== undefined ? Boolean( info.minify ) : true;

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
				'--version', `${this.workspace.getVersion()} (${this.preset})`
			],
			optionalArgs = {
				'--overwrite': this.overwrite === true,
				'--no-zip': this.zip === false,
				'--no-tar': this.tar === false,
				'-s': this.skip
			};

		if ( this.workspace.getRevision() ) {
			ret = ret.concat( [ '--revision', this.workspace.getRevision() ] );
		}

		if ( !this.minify ) {
			ret.push( '--leave-js-unminified', '--leave-css-unminified' );
		}

		ret = ret.concat( [ '--build-config', this.presetPath ] );

		for ( let argName in optionalArgs ) {
			if ( optionalArgs[ argName ] === true ) {
				ret.push( argName );
			}
		}

		return ret;
	}

	getPlugins() {
		return this._parsePresetConfig( this.presetPath )
			.then( ( config ) => {
				return config.plugins;
			} );
	}

	/**
	 * Parses preset config under given `path` and returns a promise that will provide config given.
	 *
	 * If `CKBUILDER_CONFIG` variable is missing it will reject the promise.
	 *
	 * @param {String} path
	 * @returns Promise<object>
	 * @memberOf BuildInfo
	 */
	_parsePresetConfig( path ) {
		const vm = require( 'vm' ),
			fs = require( 'fs' );

		return new Promise( ( resolve, reject ) => {
			const sandbox = {};

			fs.readFile( path, 'utf-8', ( err, code ) => {
				if ( err ) {
					reject( err );
				} else {
					vm.createContext( sandbox );

					vm.runInContext( code, sandbox );

					if ( 'CKBUILDER_CONFIG' in sandbox === false ) {
						reject( new Error( 'Parsed preset config did not expose CKBUILDER_CONFIG variable.' ) );
					}

					resolve( sandbox.CKBUILDER_CONFIG );
				}
			} );
		} );
	}
}

module.exports = BuildInfo;