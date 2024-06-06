/**
 * Helper function to split a comma-separated string into an array.
 * @param {string} str - The comma-separated string.
 * @returns {Array<string>} The resulting array of strings.
 */
function explodeStringToArray ( str ) {
	return str.split( ',' ).map( item => item.trim() );
}

/**
 * Function to sanitize order data.
 * @param {Array<string>} names - Array of item names.
 * @param {Array<string>} prices - Array of item prices.
 * @param {Array<string>} skus - Array of item SKUs.
 * @returns {Array<Object>} An array of sanitized order items.
 * @throws {Error} If the data is invalid.
 */
function sanitizeOrderData ( names, prices, skus ) {
	if ( names.length !== prices.length || names.length !== skus.length ) {
		throw new Error( "The number of item names, prices, and SKUs do not match" );
	}
	
	const orderItems = [];
	for ( let i = 0; i < names.length; i++ ) {
		const price = parseFloat( prices[i] );
		if ( isNaN( price ) ) {
			throw new Error( `Invalid price at index ${ i }: ${ prices[i] }` );
		}
		
		orderItems.push( {
			                 name:  names[i].trim(),
			                 price: Math.round( price * 100 ), // Convert to cents for Stripe
			                 sku:   skus[i].trim()
		                 } );
	}
	
	return orderItems;
}
