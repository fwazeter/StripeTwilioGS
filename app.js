/**
 * Function to handle the entire order process. Not in use right now.
 * It sanitizes the order data, finds or creates a customer, creates an invoice, and sends the invoice link via SMS.
 * @param {string} email - The email of the customer.
 * @param {string} name - The name of the customer.
 * @param {string} phoneNumber - The phone number of the customer.
 * @param {string} address - The address of the customer.
 * @param {string} nameString - Comma-separated string of item names.
 * @param {string} priceString - Comma-separated string of item prices.
 * @returns {Object} An object containing the customer ID, invoice ID, and invoice link.
 * @throws {Error} If any step in the process fails.
 */
async function handleOrder ( email, name, phoneNumber, address, nameString, priceString ) {
	try {
		const orderItems = sanitizeOrderData( explodeStringToArray( nameString ), explodeStringToArray( priceString ) );
		console.log( "Order data sanitized successfully." );
		
		const customerId = await findOrCreateCustomer( email, name, phoneNumber, address );
		if ( !customerId ) {
			throw new Error( "Failed to retrieve or create customer ID" );
		}
		console.log( "Customer ID retrieved successfully: " + customerId );
		
		const invoiceData = await createInvoice( customerId, orderItems );
		console.log( "Invoice created successfully with ID: " + invoiceData.invoiceId );
		
		await sendInvoiceLink( invoiceData.invoiceLink, phoneNumber, name );
		console.log( "Invoice link sent successfully." );
		
		return {
			customerId:  customerId,
			invoiceId:   invoiceData.invoiceId,
			invoiceLink: invoiceData.invoiceLink,
		};
	} catch ( error ) {
		console.log( `Error in handleOrder: ${ error.message }` );
		console.log( error.stack );
		throw error;
	}
}
