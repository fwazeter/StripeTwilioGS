/**
 * Class representing a service for managing messages via Twilio API.
 */
class MessageService extends BaseService
{
	/**
	 * Create a MessageService.
	 * @param {API} api - The API client instance.
	 * @param {ValidationUtility} validator - Validation class instance.
	 * @param {Logger} logger - Error and message logger class.
	 */
	constructor ( api, validator, logger ) {
		super( api, validator, logger );
		this._endpoint = 'Messages.json';
		this._phoneNumber = Config.TWILIO_PHONE_NUMBER;
	}
	
	// Getter and Setter for Endpoint
	get endpoint () {
		return this._endpoint;
	}
	
	set endpoint ( value ) {
		this._endpoint = value;
	}
	
	// Getter and Setter for phone number
	get phoneNumber () {
		return this._phoneNumber;
	}
	
	set phoneNumber ( value ) {
		this.validator.phoneNumber( value );
		this._phoneNumber = value;
	}
	
	/**
	 * Send a message.
	 * @param {Object} data - The message data.
	 * @param {Object} [headers={}] - Additional headers for the request.
	 * @returns {Object} The response from Twilio API.
	 * @throws {Error} If the data is invalid.
	 */
	async send ( data, headers = { 'Content-Type': 'application/x-www-form-urlencoded' } ) {
		this.validator.data( data, [ 'To', 'From', 'Body' ] );
		this.validator.phoneNumber( data.To );
		this.validator.phoneNumber( data.From );
		
		return await this.handleRequest(
			async () => await this.api.post( this.endpoint, data, headers ),
			'Send message'
		);
	}
	
	/**
	 * Create a message with configurable content.
	 * @param {string} to - The recipient's phone number.
	 * @param {string} bodyTemplate - The message template with placeholders.
	 * @param {Object} placeholders - An object containing placeholder values.
	 * @returns {Object} The response from Twilio API.
	 */
	async create ( to, bodyTemplate, placeholders ) {
		const body = this._generateMessageBody( bodyTemplate, placeholders );
		const data = {
			To:   to,
			From: this.phoneNumber,
			Body: body
		};
		
		return await this.send( data );
	}
	
	/**
	 * List all messages.
	 * @param {Object} params - The query parameters for listing messages.
	 * @returns {Object} The list of messages.
	 */
	async list ( params = {} ) {
		return await this.handleRequest(
			async () => await this.api.get( this.endpoint, params ),
			'List messages'
		);
	}
	
	/**
	 * Retrieve a message by SID.
	 * @param {string} sid - The SID of the message to retrieve.
	 * @returns {Object} The retrieved message.
	 * @throws {Error} If the SID is not provided.
	 */
	async getBySID ( sid ) {
		if ( !sid ) {
			throw new Error( 'Message SID is required' );
		}
		return await this.handleRequest(
			async () => await this.api.get( `${ this.endpoint }/${ sid }.json` ),
			'Retrieve message by SID'
		);
	}
	
	/**
	 * Generate a message body by replacing placeholders in the template.
	 * @param {string} template - The message template.
	 * @param {Object} placeholders - An object containing placeholder values.
	 * @returns {string} The generated message body.
	 */
	_generateMessageBody ( template, placeholders ) {
		let body = template;
		for ( const key in placeholders ) {
			const placeholder = new RegExp( `{${key}}`, 'g' );
			body = body.replace( placeholder, placeholders[key] );
		}
		
		return body;
	}
}

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = MessageService;
}
