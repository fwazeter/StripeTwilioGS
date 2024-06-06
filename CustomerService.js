/**
 * Class representing a service for managing customers via Stripe API.
 */
class CustomerService extends BaseService
{
	/**
	 * Create a CustomerService.
	 * @param {API} api - The API client instance.
	 * @param {ValidationUtility} validator - Validation class instance.
	 * @param {Logger} logger - Error and message logger class.
	 */
	constructor ( api, validator, logger ) {
		super( api, validator, logger );
		this._endpoint = "customers";
	}
	
	// Getter and Setter for Endpoint
	get endpoint () {
		return this._endpoint;
	}
	
	set endpoint ( value ) {
		this._endpoint = value;
	}
	
	/**
	 * Retrieve a customer by email.
	 * @param {string} email - The email of the customer to retrieve.
	 * @returns {Object} The retrieved customer or null if not found.
	 * @throws {Error} If the email is not provided.
	 */
	async getByEmail ( email ) {
		this.validator.email( email );
		
		const response = await this.handleRequest(
			async () => await this.api.get( this.endpoint, { email } ),
			"Retrieve customer by email"
		);
		
		this.logger.log( "getByEmail response:", response );
		
		return response;
	}
	
	/**
	 * Create a new customer.
	 * @param {Object} data - The customer data.
	 * @param {Object} [headers={}] - Additional headers for the request.
	 * @returns {Object} The created customer.
	 * @throws {Error} If the data is invalid.
	 */
	async create ( data, headers = { "Content-Type": "application/x-www-form-urlencoded" } ) {
		this.validator.data( data, [ "email" ] );
		this.validator.email( data.email );
		
		if ( data.address ) {
			data = {
				...data,
				"address[line1]":       data.address.line1,
				"address[city]":        data.address.city,
				"address[state]":       data.address.state,
				"address[postal_code]": data.address.postal_code
			};
			delete data.address;
		}
		
		if ( data.description && data.description.length > 350 ) {
			data.description = data.description.substring( 0, 350 );
		}
		
		this.logger.log( "create - data being sent:", data );
		const response = await this.handleRequest(
			async () => await this.api.post( this.endpoint, data, headers ),
			"Create customer"
		);
		
		this.logger.log( "create response:", response );
		
		return response;
	}
	
	/**
	 * Get or create a customer by email.
	 * @param {string} email - The email of the customer to get or create.
	 * @param {Object} [data={}] - The customer data for creation if the customer does not exist.
	 * @returns {Object} The retrieved or created customer.
	 * @throws {Error} If the email is not provided.
	 */
	async getOrCreateByEmail ( email, data = {} ) {
		try {
			const customer = await this.getByEmail( email );
			this.logger.log( "getOrCreateByEmail - customer:", customer );
			if ( customer.data && customer.data.length > 0 ) {
				return customer.data[0];
			} else {
				return await this.create( data );
			}
		} catch ( error ) {
			throw new Error( `Failed to get or create customer by email: ${ error.message }` );
		}
	}
}

if ( typeof module !== "undefined" && module.exports ) {
	module.exports = CustomerService;
}
