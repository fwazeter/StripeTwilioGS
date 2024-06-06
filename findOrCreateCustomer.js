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
