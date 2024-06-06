const API = require( '../API.js' );
const Logger = require( '../Logger.js' );
const Injector = require( '../Injector.js' );
const CustomerService = require( '../CustomerService.js' );
const ValidationUtility = require( '../ValidationUtility.js' );

/**
 * Setup injector for dependency injection.
 * @returns {Injector} Configured injector instance.
 */
function setupInjector () {
	const injector = new Injector();
	
	// Registering the Logger service
	injector.register( 'Logger', () => new Logger() );
	
	// Registering the Validator service
	injector.register( 'Validator', () => ValidationUtility );
	
	// Registering the API service
	injector.register( 'API', ( injector ) => {
		const config = {
			apiKey:  'sk_test_51MD9l6JFwRbRCsknXPuvwXOahPt0yqtcYetmavYCG1kUscRtNv50iaEhqWi1HzeJkepqvqW6xSaMZLnhTRP7DGXG00Rv6j7r7N',
			baseUrl: 'https://api.stripe.com/v1/' // Use the Stripe API endpoint
		};
		const logger = injector.get( 'Logger' );
		return new API( config, logger );
	} );
	
	// Registering the CustomerService
	injector.register( 'CustomerService', ( injector ) => {
		const api = injector.get( 'API' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new CustomerService( api, validator, logger );
	} );
	
	return injector;
}

const testResults = {
	passed: [],
	failed: []
};

/**
 * Run basic tests for CustomerService.
 * @param {CustomerService} customerService - The customer service instance.
 */
async function runBasicTests ( customerService ) {
	// Test GET by Email
	try {
		const response = await customerService.getByEmail( 'customer@example.com' );
		console.log( 'GET by Email response:', response );
		testResults.passed.push( 'GET by Email' );
	} catch ( error ) {
		console.error( 'GET by Email request error:', error );
		testResults.failed.push( `GET by Email: ${ error.message }` );
	}
	
	// Test GET by ID
	try {
		const response = await customerService.getByID( 'cus_QEG1oKGihg7NmN' );
		console.log( 'GET by ID response:', response );
		testResults.passed.push( 'GET by ID' );
	} catch ( error ) {
		console.error( 'GET by ID request error:', error );
		testResults.failed.push( `GET by ID: ${ error.message }` );
	}
	
	// Test CREATE customer
	try {
		const data = { email: 'newcustomer@example.com', description: 'New Customer' };
		const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
		const response = await customerService.create( data, headers );
		console.log( 'CREATE customer response:', response );
		testResults.passed.push( 'CREATE customer' );
	} catch ( error ) {
		console.error( 'CREATE customer request error:', error );
		testResults.failed.push( `CREATE customer: ${ error.message }` );
	}
	
	// Test UPDATE customer
	try {
		const data = { description: 'Updated Description' };
		const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
		const response = await customerService.update( 'cus_QEG1oKGihg7NmN', data, headers );
		console.log( 'UPDATE customer response:', response );
		testResults.passed.push( 'UPDATE customer' );
	} catch ( error ) {
		console.error( 'UPDATE customer request error:', error );
		testResults.failed.push( `UPDATE customer: ${ error.message }` );
	}
	
	// Test DELETE customer
	try {
		const newCustomer = await customerService.create( { email:         'deletetest@example.com',
			                                                  description: 'Delete Test'
		                                                  } );
		const response = await customerService.delete( newCustomer.id );
		console.log( 'DELETE customer response:', response );
		testResults.passed.push( 'DELETE customer' );
	} catch ( error ) {
		console.error( 'DELETE customer request error:', error );
		testResults.failed.push( `DELETE customer: ${ error.message }` );
	}
	
	// Test LIST customers
	try {
		const response = await customerService.list( { limit: 10 } );
		console.log( 'LIST customers response:', response );
		testResults.passed.push( 'LIST customers' );
	} catch ( error ) {
		console.error( 'LIST customers request error:', error );
		testResults.failed.push( `LIST customers: ${ error.message }` );
	}
}

/**
 * Run complicated tests for CustomerService.
 * @param {CustomerService} customerService - The customer service instance.
 */
async function runComplicatedTests ( customerService ) {
	// Test handling invalid email
	try {
		await customerService.getByEmail( 'invalidemail' );
		testResults.failed.push( 'Invalid email should have thrown an error' );
	} catch ( error ) {
		console.error( 'Invalid email error:', error.message );
		testResults.passed.push( 'Invalid email' );
	}
	
	// Test handling missing required fields
	try {
		await customerService.create( {} );
		testResults.failed.push( 'Missing required fields should have thrown an error' );
	} catch ( error ) {
		console.error( 'Missing required fields error:', error.message );
		testResults.passed.push( 'Missing required fields' );
	}
	
	// Test handling large payload
	try {
		const largeData = { email: 'large@example.com', description: 'A'.repeat( 350 ) };
		const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
		const response = await customerService.create( largeData, headers );
		console.log( 'Large payload CREATE response:', response );
		testResults.passed.push( 'Large payload CREATE' );
	} catch ( error ) {
		console.error( 'Large payload CREATE error:', error );
		testResults.failed.push( `Large payload CREATE: ${ error.message }` );
	}
	
	// Test handling 404 errors
	try {
		const response = await customerService.getByID( 'non_existent_id' );
		console.log( 'GET non-existent ID response:', response );
		testResults.failed.push( 'GET non-existent ID should have thrown an error' );
	} catch ( error ) {
		console.error( 'GET non-existent ID error:', error.message );
		testResults.passed.push( 'GET non-existent ID' );
	}
}

/**
 * Test the CustomerService class.
 */
async function testCustomerService () {
	const injector = setupInjector();
	const customerService = injector.get( 'CustomerService' );
	
	console.log( 'Running basic tests...' );
	await runBasicTests( customerService );
	
	console.log( 'Running complicated tests...' );
	await runComplicatedTests( customerService );
	
	console.log( '\nTest Results Summary:' );
	console.log( 'Passed Tests:' );
	testResults.passed.forEach( test => console.log( `  - ${ test }` ) );
	console.log( 'Failed Tests:' );
	testResults.failed.forEach( test => console.log( `  - ${ test }` ) );
}

testCustomerService();
