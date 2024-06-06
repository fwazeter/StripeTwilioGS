/**
 * Class representing a service for managing invoices via Stripe API.
 */
class InvoiceService extends BaseService
{
	/**
	 * Create an InvoiceService.
	 * @param {API} api - The API client instance.
	 * @param {ValidationUtility} validator - Validation class instance.
	 * @param {Logger} logger - Error and message logger class.
	 */
	constructor ( api, validator, logger ) {
		super( api, validator, logger );
		this._endpoint = "invoices";
		this._invoiceItemsEndpoint = "invoiceitems";
	}
	
	// Getter and Setter for Endpoint
	get endpoint () {
		return this._endpoint;
	}
	
	set endpoint ( value ) {
		this._endpoint = value;
	}
	
	// Getter and Setter for InvoiceItems Endpoint
	get invoiceItemsEndpoint () {
		return this._invoiceItemsEndpoint;
	}
	
	set invoiceItemsEndpoint ( value ) {
		this._invoiceItemsEndpoint = value;
	}
	
	/**
	 * Create a new invoice item.
	 * @param {Object} data - The invoice item data.
	 * @returns {Object} The created invoice item.
	 * @throws {Error} If the data is invalid.
	 */
	async createInvoiceItem ( data ) {
		this.validator.data( data, [ "customer", "amount", "currency" ] );
		const headers = { "Content-Type": "application/x-www-form-urlencoded" };
		return await this.handleRequest(
			async () => await this.api.post( this.invoiceItemsEndpoint, data, headers ),
			"Create Invoice Item"
		);
	}
	
	/**
	 * Create a new invoice.
	 * @param {Object} data - The invoice data.
	 * @returns {Object} The created invoice.
	 * @throws {Error} If the data is invalid.
	 */
	async create ( data ) {
		this.validator.data( data, [ "customer" ] );
		const headers = { "Content-Type": "application/x-www-form-urlencoded" };
		return await this.handleRequest(
			async () => await this.api.post( this.endpoint, data, headers ),
			"Create Invoice"
		);
	}
	
	/**
	 * Finalize an invoice by ID.
	 * @param {string} id - The ID of the invoice to finalize.
	 * @returns {Object} The finalized invoice.
	 * @throws {Error} If the invoice ID is not provided.
	 */
	async finalizeInvoice ( id ) {
		this.validator.data( { id }, [ "id" ] );
		const headers = { "Content-Type": "application/x-www-form-urlencoded" };
		return await this.handleRequest(
			async () => await this.api.post( `${ this.endpoint }/${ id }/finalize`, {}, headers ),
			"Finalize Invoice"
		);
	}
	
	/**
	 * Retrieve an invoice by ID.
	 * @param {string} id - The ID of the invoice to retrieve.
	 * @returns {Object} The retrieved invoice.
	 * @throws {Error} If the invoice ID is not provided.
	 */
	async getById ( id ) {
		this.validator.data( { id }, [ "id" ] );
		return await this.handleRequest(
			async () => await this.api.get( `${ this.endpoint }/${ id }` ),
			"Retrieve invoice by ID"
		);
	}
	
	/**
	 * Update an existing invoice.
	 * @param {string} id - The ID of the invoice to update.
	 * @param {Object} data - The updated invoice data.
	 * @returns {Object} The updated invoice.
	 * @throws {Error} If the invoice ID is not provided or the data is invalid.
	 */
	async update ( id, data ) {
		this.validator.data( { id }, [ "id" ] );
		this.validator.data( data, [] );
		const headers = { "Content-Type": "application/x-www-form-urlencoded" };
		return await this.handleRequest(
			async () => await this.api.patch( `${ this.endpoint }/${ id }`, data, headers ),
			"Update invoice"
		);
	}
	
	/**
	 * Delete an invoice by ID.
	 * @param {string} id - The ID of the invoice to delete.
	 * @returns {Object} The response from the delete operation.
	 * @throws {Error} If the invoice ID is not provided.
	 */
	async delete ( id ) {
		this.validator.data( { id }, [ "id" ] );
		return await this.handleRequest(
			async () => await this.api.delete( `${ this.endpoint }/${ id }` ),
			"Delete Invoice"
		);
	}
	
	/**
	 * List all invoices.
	 * @param {Object} params - The query parameters for listing invoices.
	 * @returns {Object} The list of invoices.
	 */
	async list ( params = {} ) {
		return await this.handleRequest(
			async () => await this.api.get( this.endpoint, params ),
			"List invoices"
		);
	}
}

if ( typeof module !== "undefined" && module.exports ) {
	module.exports = InvoiceService;
}
