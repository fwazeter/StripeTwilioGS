const API = require( '../API.js' );
const Logger = require( '../Logger.js' );
const Injector = require( '../Injector.js' );

function setupInjector () {
	const injector = new Injector();
	
	// Registering the Logger service
	injector.register( 'Logger', () => Logger );
	
	// Registering the API service
	injector.register( 'API', ( injector ) => {
		const config = {
			apiKey:  'sk_test_51MD9l6JFwRbRCsknXPuvwXOahPt0yqtcYetmavYCG1kUscRtNv50iaEhqWi1HzeJkepqvqW6xSaMZLnhTRP7DGXG00Rv6j7r7N',
			baseUrl: 'https://api.stripe.com/v1/' // Use a valid testing endpoint
		};
		const logger = injector.get( 'Logger' );
		return new API( config, logger );
	} );
	
	return injector;
}

async function runBasicTests ( api ) {
	// Test GET request
	try {
		const response = await api.get( 'posts/1' );
		console.log( 'GET response:', response );
	} catch ( error ) {
		console.error( 'GET request error:', error );
	}
	
	// Test POST request
	try {
		const data = { title: 'foo', body: 'bar', userId: 1 };
		const response = await api.post( 'posts', data );
		console.log( 'POST response:', response );
	} catch ( error ) {
		console.error( 'POST request error:', error );
	}
	
	// Test PUT request
	try {
		const data = { id: 1, title: 'foo', body: 'bar', userId: 1 };
		const response = await api.put( 'posts/1', data );
		console.log( 'PUT response:', response );
	} catch ( error ) {
		console.error( 'PUT request error:', error );
	}
	
	// Test PATCH request
	try {
		const data = { title: 'foo' };
		const response = await api.patch( 'posts/1', data );
		console.log( 'PATCH response:', response );
	} catch ( error ) {
		console.error( 'PATCH request error:', error );
	}
	
	// Test DELETE request
	try {
		const response = await api.delete( 'posts/1' );
		console.log( 'DELETE response:', response );
	} catch ( error ) {
		console.error( 'DELETE request error:', error );
	}
}

async function runComplicatedTests ( api ) {
	// Test handling large payloads
	try {
		const largeData = { title: 'foo'.repeat( 1000 ), body: 'bar'.repeat( 1000 ), userId: 1 };
		const response = await api.post( 'posts', largeData );
		console.log( 'Large POST response:', response );
	} catch ( error ) {
		console.error( 'Large POST request error:', error );
	}
	
	// Test retry logic
	const originalFetch = global.fetch;
	global.fetch = async ( url, options ) => {
		const shouldFail = Math.random() > 0.5;
		if ( shouldFail ) {
			const error = new Error( 'Simulated network failure' );
			error.response = { ok: false, status: 500 };
			throw error;
		}
		return originalFetch( url, options );
	};
	
	try {
		const response = await api.get( 'posts/1' );
		console.log( 'GET with retry response:', response );
	} catch ( error ) {
		console.error( 'GET with retry error:', error );
	}
	finally {
		global.fetch = originalFetch;
	}
	
	// Test handling 404 errors
	try {
		const response = await api.get( 'posts/999999' );
		console.log( 'GET 404 response:', response );
	} catch ( error ) {
		console.error( 'GET 404 error:', error );
	}
}

async function testAPI () {
	const injector = setupInjector();
	const api = injector.get( 'API' );
	
	console.log( 'Running basic tests...' );
	await runBasicTests( api );
	
	console.log( 'Running complicated tests...' );
	await runComplicatedTests( api );
}

testAPI();
