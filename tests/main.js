
// Main file with chai and other lib configuration.

require( 'chai' ).use( require( 'sinon-chai') );
require( 'chai' ).use( require( 'chai-as-promised') );

global.sinon = require( 'sinon' );
global.proxyquire = require( 'proxyquire' );
global.expect = require( 'chai' ).expect;