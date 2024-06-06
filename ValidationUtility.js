/**
 * Utility class for common validation methods.
 */
class ValidationUtility
{
	/**
	 * Validate email format.
	 * @param {string} email - The email to validate.
	 * @throws {Error} If the email is invalid.
	 */
	email ( email ) {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if ( !emailPattern.test( email ) ) {
			throw new Error( 'Invalid email format' );
		}
	}
	
	/**
	 * Validate phone number format.
	 * @param {string} phoneNumber - The phone number to validate.
	 * @throws {Error} If the phone number is invalid.
	 */
	phoneNumber ( phoneNumber ) {
		const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
		if ( !phoneNumberPattern.test( phoneNumber ) ) {
			throw new Error( 'Invalid phone number format' );
		}
	}
	
	/**
	 * Validate general data.
	 * @param {Object} data - The data to validate.
	 * @param {Array<string>} requiredFields - List of required fields.
	 * @throws {Error} If the data is invalid.
	 */
	data ( data, requiredFields ) {
		if ( !data || typeof data !== 'object' ) {
			throw new Error( 'Invalid data: Must be a non-null object' );
		}
		requiredFields.forEach( field => {
			if ( !data[field] ) {
				throw new Error( `Missing required field: ${ field }` );
			}
		} );
	}
}

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = ValidationUtility;
}
