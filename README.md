# Stripe and Twilio Integration for Google Apps Script

This project integrates Stripe and Twilio with Google Apps Script to manage customer data, create invoices, and send SMS
notifications.

## Features

- Manage customer data with Stripe.
- Create and finalize invoices with Stripe.
- Send SMS notifications with Twilio.
- Structured error handling and logging.

## Prerequisites

- Google Apps Script account.
- Stripe account with API keys.
- Twilio account with API keys and phone number.

## Setup

### Clone the Repository

1. Open your Google Apps Script project.
2. Create the following files and copy the corresponding code from this repository:
    - `Config.gs`
    - `API.gs`
    - `Logger.gs`
    - `Validator.gs`
    - `BaseService.gs`
    - `CustomerService.gs`
    - `InvoiceService.gs`
    - `MessageService.gs`
    - `Injector.gs`
    - `OrderHandler.gs`

### Config File

Create a `Config.gs` file and add your Stripe and Twilio credentials:

```javascript
const Config = {
	STRIPE_API_KEY:      "sk_test_your_stripe_api_key",
	BASE_STRIPE_URL:     "https://api.stripe.com/v1/",
	TWILIO_ACCOUNT_SID:  "your_twilio_account_sid",
	TWILIO_AUTH_TOKEN:   "your_twilio_auth_token",
	TWILIO_PHONE_NUMBER: "+your_twilio_phone_number",
	BASE_TWILIO_URL:     "https://api.twilio.com/2010-04-01/Accounts/your_twilio_account_sid"
};
```

### Injector Setup

Create an Injector.gs file to manage dependencies:

```javascript
function setupInjector () {
	const injector = new Injector();
	
	injector.register( 'Logger', () => new Logger() );
	injector.register( 'Validator', () => new ValidationUtility() );
	
	injector.register( 'API', ( injector ) => {
		const config = {
			apiKey:  Config.STRIPE_API_KEY,
			baseUrl: Config.BASE_STRIPE_URL,
		};
		const logger = injector.get( 'Logger' );
		return new API( config, logger );
	} );
	
	injector.register( 'CustomerService', ( injector ) => {
		const api = injector.get( 'API' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new CustomerService( api, validator, logger );
	} );
	
	injector.register( 'InvoiceService', ( injector ) => {
		const api = injector.get( 'API' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new InvoiceService( api, validator, logger );
	} );
	
	injector.register( 'MessageService', ( injector ) => {
		const config = {
			apiKey:     Config.TWILIO_AUTH_TOKEN,
			baseUrl:    Config.BASE_TWILIO_URL,
			accountSid: Config.TWILIO_ACCOUNT_SID
		};
		const api = new API( config, injector.get( 'Logger' ) );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new MessageService( api, validator, logger );
	} );
	
	return injector;
}

// Initialize the injector
const injector = setupInjector();

```

### Usage

#### Finding or Creating a Customer

Use the findOrCreateCustomer function to find or create a customer by email:

```javascript
/**
 * Function to find or create a customer by email.
 * @param {string} email - The email of the customer.
 * @param {string} name - The name of the customer.
 * @param {string} phoneNumber - The phone number of the customer.
 * @param {string} address - The address of the customer.
 * @returns {string} The customer ID.
 * @throws {Error} If the customer ID cannot be retrieved or created.
 */
async function findOrCreateCustomer ( email, name, phoneNumber, address ) {
	const customerService = injector.get( "CustomerService" );
	
	const customerData = {
		email:                  email,
		name:                   name,
		phone:                  phoneNumber,
		'address[line1]':       address.split( ',' )[0],
		'address[city]':        address.split( ',' )[1].trim(),
		'address[state]':       address.split( ',' )[2].trim().split( ' ' )[0],
		'address[postal_code]': address.split( ',' )[2].trim().split( ' ' )[1]
	};
	
	const customer = await customerService.getOrCreateByEmail( email, customerData );
	
	if ( customer && customer.id ) {
		return customer.id;
	} else {
		throw new Error( "Failed to retrieve or create customer ID" );
	}
}

```

#### Creating an Invoice

Use the createInvoice function to create an invoice for a customer:

```javascript
/**
 * Function to create an invoice for a customer with order items.
 * @param {string} customerId - The ID of the customer.
 * @param {Array<Object>} orderItems - The order items with names and prices.
 * @returns {Object} An object containing the invoice ID and invoice link.
 * @throws {Error} If the invoice cannot be created.
 */
async function createInvoice ( customerId, orderItems ) {
	const invoiceService = injector.get( "InvoiceService" );
	
	try {
		// Create the invoice first
		const invoiceData = {
			customer:     customerId,
			auto_advance: false  // Do not auto-finalize the invoice
		};
		
		const invoiceResponse = await invoiceService.create( invoiceData );
		console.log( "Create Invoice successful:", invoiceResponse );
		
		if ( !invoiceResponse.id ) {
			throw new Error( "Failed to create invoice" );
		}
		
		// Create invoice items for each order item
		for ( const item of orderItems ) {
			const invoiceItemData = {
				customer:    customerId,
				amount:      item.price,
				currency:    "usd",
				description: item.name,
				invoice:     invoiceResponse.id // Link the item directly to the invoice
			};
			
			const invoiceItemResponse = await invoiceService.createInvoiceItem( invoiceItemData );
			console.log( "Create Invoice Item successful:", invoiceItemResponse );
		}
		
		// Finalize the invoice
		const finalizedInvoiceResponse = await invoiceService.finalizeInvoice( invoiceResponse.id );
		console.log( "Finalize Invoice successful:", finalizedInvoiceResponse );
		
		if ( !finalizedInvoiceResponse.hosted_invoice_url ) {
			throw new Error( "Failed to finalize invoice" );
		}
		
		return {
			invoiceId:   finalizedInvoiceResponse.id,
			invoiceLink: finalizedInvoiceResponse.hosted_invoice_url
		};
	} catch ( error ) {
		console.log( `Error in createInvoice: ${ error.message }` );
		throw error;
	}
}

```

#### Testing the Integration

Use the testFindOrCreateCustomer function to test the customer creation process:

```javascript
/**
 * Function to test the findOrCreateCustomer function with dummy data.
 * It initializes necessary data and calls the findOrCreateCustomer function.
 */
async function testFindOrCreateCustomer () {
	const email = "testingfour6@example.com";
	const name = "John Doe";
	const phoneNumber = "+18016473470";
	const address = "123 Test St, Test City, TX 12345";
	
	try {
		const customerId = await findOrCreateCustomer( email, name, phoneNumber, address );
		console.log( "Test completed successfully:" );
		console.log( "Customer ID: " + customerId );
	} catch ( error ) {
		console.log( "Test failed:" );
		console.log( error.message );
		console.log( error.stack );
	}
}

// Run the test
testFindOrCreateCustomer();

```

