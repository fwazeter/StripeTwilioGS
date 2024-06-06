/**
 * Function to send the invoice link to the customer via SMS.
 * @param {string} invoiceLink - The invoice link.
 * @param {string} phoneNumber - The customer's phone number.
 * @param {string} name - The customer's name.
 */
async function sendInvoiceLink ( invoiceLink, phoneNumber, name ) {
	const messageService = injector.get( 'MessageService' );
	const bodyTemplate = `Thank you ${ name } for your order. Click the following link to view or pay your invoice: ${ invoiceLink }`;
	
	try {
		const response = await messageService.create( phoneNumber, bodyTemplate, {} );
		console.log( "Message sent successfully:", response );
	} catch ( error ) {
		console.log( `Error in sendInvoiceLink: ${ error.message }` );
		console.log( error.stack );
		throw error;
	}
}
