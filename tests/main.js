// Main file with chai and other lib configuration.

'use strict';

require( 'chai' ).use( require( 'sinon-chai' ) );
require( 'chai' ).use( require( 'chai-as-promised' ) );
require( 'chai' ).use( require( 'chai-fs' ) );

global.path = require( 'path' );
global.sinon = require( 'sinon' );
global.proxyquire = require( 'proxyquire' );
global.expect = require( 'chai' ).expect;
global._ = require( 'lodash' );

require( 'sinon-as-promised' );