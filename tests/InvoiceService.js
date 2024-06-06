const API = require( '../API.js' );
const Logger = require( '../Logger.js' );
const Injector = require( '../Injector.js' );
const CustomerService = require( '../CustomerService.js' );
const InvoiceService = require( '../InvoiceService.js' );
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
	
	// Registering the InvoiceService
	injector.register( 'InvoiceService', ( injector ) => {
		const api = injector.get( 'API' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new InvoiceService( api, validator, logger );
	} );
	
	return injector;
}

const testResults = {
	passed: [],
	failed: []
};

/**
 * Run basic tests for InvoiceService.
 * @param {InvoiceService} invoiceService - The invoice service instance.
 * @param {CustomerService} customerService - The customer service instance.
 */
async function runBasicTests ( invoiceService, customerService ) {
	// Ensure customer exists for testing
	let customerId;
	try {
		const customer = await customerService.getOrCreateByEmail( 'invoice_test@example.com',
		                                                           {
			                                                           email:       'invoice_test@example.com',
			                                                           description: 'Test Customer'
		                                                           }
		);
		customerId = customer.id;
	} catch ( error ) {
		console.error( 'Setup customer error:', error );
		testResults.failed.push( `Setup customer: ${ error.message }` );
		return;
	}
	
	// Test CREATE invoice item and invoice
	let invoiceItemId;
	try {
		const data = { customer: customerId, amount: 500, currency: 'usd' };
		const response = await invoiceService.createInvoiceItem( data );
		invoiceItemId = response.id;
		console.log( 'CREATE invoice item response:', response );
		testResults.passed.push( 'CREATE invoice item' );
	} catch ( error ) {
		console.error( 'CREATE invoice item request error:', error );
		testResults.failed.push( `CREATE invoice item: ${ error.message }` );
		return;
	}
	
	try {
		const data = { customer: customerId, auto_advance: true }; // 'auto_advance' allows Stripe to finalize the
		                                                           // invoice automatically
		const response = await invoiceService.create( data );
		console.log( 'CREATE invoice response:', response );
		testResults.passed.push( 'CREATE invoice' );
	} catch ( error ) {
		console.error( 'CREATE invoice request error:', error );
		testResults.failed.push( `CREATE invoice: ${ error.message }` );
		return;
	}
	
	// Retrieve an invoice ID for further tests
	let invoiceId;
	try {
		const invoices = await invoiceService.list( { limit: 1 } );
		invoiceId = invoices.data[0].id;
	} catch ( error ) {
		console.error( 'List invoices error:', error );
		testResults.failed.push( `List invoices: ${ error.message }` );
		return;
	}
	
	// Test GET by ID
	try {
		const response = await invoiceService.getById( invoiceId );
		console.log( 'GET by ID response:', response );
		testResults.passed.push( 'GET by ID' );
	} catch ( error ) {
		console.error( 'GET by ID request error:', error );
		testResults.failed.push( `GET by ID: ${ error.message }` );
	}
	
	// Test UPDATE invoice
	try {
		const data = { description: 'Updated Invoice Description' };
		const response = await invoiceService.update( invoiceId, data );
		console.log( 'UPDATE invoice response:', response );
		testResults.passed.push( 'UPDATE invoice' );
	} catch ( error ) {
		console.error( 'UPDATE invoice request error:', error );
		testResults.failed.push( `UPDATE invoice: ${ error.message }` );
	}
	
	// Test DELETE invoice
	try {
		const response = await invoiceService.delete( invoiceId );
		console.log( 'DELETE invoice response:', response );
		testResults.passed.push( 'DELETE invoice' );
	} catch ( error ) {
		console.error( 'DELETE invoice request error:', error );
		testResults.failed.push( `DELETE invoice: ${ error.message }` );
	}
	
	// Test LIST invoices
	try {
		const response = await invoiceService.list( { limit: 10 } );
		console.log( 'LIST invoices response:', response );
		testResults.passed.push( 'LIST invoices' );
	} catch ( error ) {
		console.error( 'LIST invoices request error:', error );
		testResults.failed.push( `LIST invoices: ${ error.message }` );
	}
}

/**
 * Run complicated tests for InvoiceService.
 * @param {InvoiceService} invoiceService - The invoice service instance.
 */
async function runComplicatedTests ( invoiceService ) {
	// Test handling invalid customer ID
	try {
		await invoiceService.create( { customer: 'invalid_customer_id', auto_advance: true } );
		testResults.failed.push( 'Invalid customer ID should have thrown an error' );
	} catch ( error ) {
		console.error( 'Invalid customer ID error:', error.message );
		testResults.passed.push( 'Invalid customer ID' );
	}
	
	// Test handling missing required fields
	try {
		await invoiceService.create( {} );
		testResults.failed.push( 'Missing required fields should have thrown an error' );
	} catch ( error ) {
		console.error( 'Missing required fields error:', error.message );
		testResults.passed.push( 'Missing required fields' );
	}
	
	// Test handling large payload
	try {
		const largeData = { customer: 'cus_large_payload_test', auto_advance: true, description: 'A'.repeat( 350 ) };
		const response = await invoiceService.create( largeData );
		console.log( 'Large payload CREATE response:', response );
		testResults.passed.push( 'Large payload CREATE' );
	} catch ( error ) {
		console.error( 'Large payload CREATE error:', error );
		testResults.failed.push( `Large payload CREATE: ${ error.message }` );
	}
	
	// Test handling 404 errors
	try {
		const response = await invoiceService.getById( 'non_existent_id' );
		console.log( 'GET non-existent ID response:', response );
		testResults.failed.push( 'GET non-existent ID should have thrown an error' );
	} catch ( error ) {
		console.error( 'GET non-existent ID error:', error.message );
		testResults.passed.push( 'GET non-existent ID' );
	}
}

/**
 * Test the InvoiceService class.
 */
async function testInvoiceService () {
	const injector = setupInjector();
	const invoiceService = injector.get( 'InvoiceService' );
	const customerService = injector.get( 'CustomerService' );
	
	console.log( 'Running basic tests...' );
	await runBasicTests( invoiceService, customerService );
	
	console.log( 'Running complicated tests...' );
	await runComplicatedTests( invoiceService );
	
	console.log( '\nTest Results Summary:' );
	console.log( 'Passed Tests:' );
	testResults.passed.forEach( test => console.log( `  - ${ test }` ) );
	console.log( 'Failed Tests:' );
	testResults.failed.forEach( test => console.log( `  - ${ test }` ) );
}

testInvoiceService();
