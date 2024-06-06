/**
 * Function to test the handleOrder function with dummy data.
 * It initializes necessary data and calls the handleOrder function.
 * Cam #: +18016473470
 */
async function testHandleOrder () {
	const email = "testingfour6@example.com";
	const name = "John Doe";
	const phoneNumber = "+18016473470";
	const address = "123 Test St, Test City, TX 12345";
	const nameString = "Item 1,Item 2,Item 3";
	const priceString = "1000,2000,3000";
	
	try {
		const result = await handleOrder( email, name, phoneNumber, address, nameString, priceString );
		console.log( "Test completed successfully:" );
		console.log( "Customer ID: " + result.customerId );
		console.log( "Invoice ID: " + result.invoiceId );
		console.log( "Invoice Link: " + result.invoiceLink );
	} catch ( error ) {
		console.log( "Test failed:" );
		console.log( error.message );
		console.log( error.stack );
	}
}

/**
 * Function to test the initInvoice function with dummy data.
 * Cam #: +18016473470
 */
async function testInitInvoice () {
	const customerId = "cus_QFCgHTMnQYoYGU"; // Replace with a valid Stripe customer ID for real testing
	const nameString = "Item 1,Item 2,Item 3";
	const priceString = "1000,2000,3000";
	
	try {
		const result = await initInvoice( customerId, nameString, priceString );
		const [ invoiceId, invoiceLink ] = result.split( "," );
		console.log( "Test completed successfully:" );
		console.log( "Invoice ID: " + invoiceId );
		console.log( "Invoice Link: " + invoiceLink );
	} catch ( error ) {
		console.log( "Test failed:" );
		console.log( error.message );
		console.log( error.stack );
	}
}

/**
 * Function to test the findOrCreateCustomer function with dummy data.
 * It initializes necessary data and calls the findOrCreateCustomer function.
 * Cam #: +18016473470
 */
async function testFindOrCreateCustomer () {
	const email = "testingfour18@example.com";
	const name = "John Doey";
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


/**
 * Function to test retrieving order items by order ID.
 * It initializes necessary data and calls the getSeparatedOrderItems function.
 */
function testRetrieveOrderItems () {
	const sheetId = '1_OrQMimyfBkKRKaJFB0LPnC4p2qjhnhUKhfJ__t-dV8';
	const sheetName = 'Submitted Orders API';
	const orderId = 'ORDER2'; // Replace with the actual order ID
	
	try {
		const orderItems = getSeparatedOrderItems( sheetId, sheetName, orderId );
		if ( orderItems.length > 0 ) {
			console.log( "Order items retrieved successfully:" );
			orderItems.forEach( item => {
				console.log( "Name: " + item.name + ", Price: " + item.price );
			} );
		} else {
			console.log( "No order items found for order ID: " + orderId );
		}
	} catch ( error ) {
		console.log( "Failed to retrieve order items:" );
		console.log( error.message );
		console.log( error.stack );
	}
}

/**
 * Function to test the initInvoice function with dummy data.
 * It initializes necessary data and calls the initInvoice function.
 */
async function testInitInvoice () {
	const customerId = 'cus_QFCgHTMnQYoYGU'; // Replace with a valid customer ID
	const nameString = "Item 1,Item 2,Item 3";
	const priceString = "1000,2000,3000"; // Prices as a comma-separated string
	
	try {
		const result = await initInvoice( customerId, nameString, priceString );
		console.log( "Test completed successfully:" );
		console.log( "Result: " + result );
	} catch ( error ) {
		console.log( "Test failed:" );
		console.log( error.message );
		console.log( error.stack );
	}
}

/**
 * Function to test the initInvoice function with data from a row in Google Sheets.
 * It retrieves the necessary data from the sheet and calls the initInvoice function.
 */
async function testInitInvoiceFromSheet () {
	// Set Sheets
	var ss = SpreadsheetApp.openById( '1_OrQMimyfBkKRKaJFB0LPnC4p2qjhnhUKhfJ__t-dV8' ); // Replace with your
	                                                                                    // spreadsheet ID
	var OrdersAPIsheet = ss.getSheetByName( 'Submitted Orders API' );
	
	// Get the last row
	var lastRow = OrdersAPIsheet.getLastRow();
	
	// Predefined valid customer ID
	var customerId = "cus_QFCgHTMnQYoYGU"; // Replace with a valid Stripe customer ID
	
	// Retrieve data from the row
	var orderId = OrdersAPIsheet.getRange( "D" + lastRow ).getValue(); // Order ID from column D
	var nameString = OrdersAPIsheet.getRange( "K" + lastRow ).getValue(); // Item names from column K
	var priceString = OrdersAPIsheet.getRange( "M" + lastRow ).getValue(); // Item prices from column M
	var skuString = OrdersAPIsheet.getRange( "L" + lastRow ).getValue(); // Item SKUs from column L
	
	// Ensure the retrieved data is treated as a string
	nameString = String( nameString );
	priceString = String( priceString );
	skuString = String( skuString );
	
	// Log the retrieved data
	console.log( "Order ID: " + orderId );
	console.log( "Name String: " + nameString );
	console.log( "Price String: " + priceString );
	console.log( "SKU String: " + skuString );
	
	try {
		const result = await initInvoice( customerId, nameString, priceString, skuString );
		console.log( "Test completed successfully:" );
		console.log( "Result: " + result );
	} catch ( error ) {
		console.log( "Test failed:" );
		console.log( error.message );
		console.log( error.stack );
	}
}



