/**
 * Function to handle the entire order process.
 * It sanitizes the order data, finds or creates a customer, creates an invoice, and returns the invoice ID and invoice
 * link.
 * @param {string} customerId - The stripe customer ID.
 * @param {string} nameString - Comma-separated string of item names.
 * @param {string} priceString - Comma-separated string of item prices.
 * @param {string} skuString - Comma-separated string of item SKUs.
 * @returns {string} A string containing the invoice ID and invoice link concatenated together, separated by a comma.
 * @throws {Error} If any step in the process fails.
 */
async function initInvoice ( customerId, nameString, priceString, skuString ) {
	try {
		// Convert inputs to strings and split into arrays
		const nameArray = String( nameString ).split( "," );
		const priceArray = String( priceString ).split( "," );
		const skuArray = String( skuString ).split( "," );
		
		// Log the arrays
		console.log( "Name Array: " + JSON.stringify( nameArray ) );
		console.log( "Price Array: " + JSON.stringify( priceArray ) );
		console.log( "SKU Array: " + JSON.stringify( skuArray ) );
		
		// Ensure arrays have the same length by filling missing values with defaults
		const maxLength = Math.max( nameArray.length, priceArray.length, skuArray.length );
		
		const orderItems = [];
		for ( let i = 0; i < maxLength; i++ ) {
			const name = nameArray[i] ? nameArray[i].trim() : "No Name";
			const price = priceArray[i] ? parseFloat( priceArray[i].trim() ) : 1.00; // Default to 1.00 if missing or 0
			const sku = skuArray[i] ? skuArray[i].trim() : "NA";
			
			orderItems.push( { name, price, sku } );
		}
		
		console.log( "Order data sanitized successfully:", orderItems );
		
		const invoiceData = await createInvoice( customerId, orderItems );
		console.log( "Invoice created successfully with ID: " + invoiceData.invoiceId );
		
		return `${ invoiceData.invoiceId },${ invoiceData.invoiceLink }`;
	} catch ( error ) {
		console.log( `Error in initInvoice: ${ error.message }` );
		console.log( error.stack );
		throw error;
	}
}

/**
 * Function to create an invoice for a customer with order items.
 * @param {string} customerId - The ID of the customer.
 * @param {Array<Object>} orderItems - The order items with names, prices, and SKUs.
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
			const name = item.name || "No Name";
			const price = item.price > 0 ? Math.round( item.price * 100 ) : 100; // Default to 1 dollar if price is 0
			                                                                     // or missing
			const sku = item.sku || "NA";
			
			const invoiceItemData = {
				customer:    customerId,
				amount:      price, // Convert to cents for Stripe
				currency:    "usd",
				description: name,
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
