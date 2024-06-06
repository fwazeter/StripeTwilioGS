/**
 * Class representing a base API client for making HTTP requests.
 */
class API
{
	/**
	 * Create an API client.
	 * @param {Object} config - The configuration object
	 * @param {string} config.apiKeySid - The API Key SID.
	 * @param {string} config.apiKeySecret - The API Key Secret.
	 * @param {string} config.baseUrl - The base URL for the API.
	 * @param {Object} [config.additionalHeaders={}] - Additional headers to include in requests.
	 * @param {number} [config.maxRetries=3] - The maximum number of retry attempts for failed requests.
	 * @param {number} [config.timeout=5000] - The timeout for requests in milliseconds.
	 * @param {Logger} logger - The error and message logger class.
	 */
	constructor (
		{ apiKeySid, apiKeySecret, baseUrl, additionalHeaders = {}, maxRetries = 3, timeout = 5000 },
		logger
	)
	{
		this._apiKeySid = apiKeySid;
		this._apiKeySecret = apiKeySecret;
		this._baseUrl = baseUrl;
		this._additionalHeaders = additionalHeaders;
		this._maxRetries = maxRetries;
		this._timeout = timeout;
		this._logger = logger;
		this._headers = {
			Authorization:  `Basic ${ Utilities.base64Encode( `${ this._apiKeySid }:${ this._apiKeySecret }` ) }`,
			"Content-Type": "application/x-www-form-urlencoded",
			...this._additionalHeaders,
		};
	}
	
	/**
	 * Convert an object to a URL encoded string.
	 * @param {Object} data - The data to be converted.
	 * @returns {string} The URL encoded string.
	 * @private
	 */
	_toUrlEncoded ( data ) {
		return Object.keys( data )
		             .map( ( key ) => encodeURIComponent( key ) + "=" + encodeURIComponent( data[key] ) )
		             .join( "&" );
	}
	
	/**
	 * Make a GET request.
	 * @param {string} endpoint - The endpoint for the GET request.
	 * @param {Object} [queryParams={}] - The query parameters for the GET request.
	 * @returns {Object} The response data.
	 */
	async get ( endpoint, queryParams = {} ) {
		return this._request( "GET", endpoint, null, queryParams );
	}
	
	/**
	 * Make a POST request.
	 * @param {string} endpoint - The endpoint for the POST request.
	 * @param {Object} data - The data to be sent in the POST request.
	 * @returns {Object} The response data.
	 */
	async post ( endpoint, data ) {
		return this._request( "POST", endpoint, data );
	}
	
	/**
	 * Make a PUT request.
	 * @param {string} endpoint - The endpoint for the PUT request.
	 * @param {Object} data - The data to be sent in the PUT request.
	 * @returns {Object} The response data.
	 */
	async put ( endpoint, data ) {
		return this._request( "PUT", endpoint, data );
	}
	
	/**
	 * Make a PATCH request.
	 * @param {string} endpoint - The endpoint for the PATCH request.
	 * @param {Object} data - The data to be sent in the PATCH request.
	 * @returns {Object} The response data.
	 */
	async patch ( endpoint, data ) {
		return this._request( "PATCH", endpoint, data );
	}
	
	/**
	 * Make a DELETE request.
	 * @param {string} endpoint - The endpoint for the DELETE request.
	 * @returns {Object} The response data.
	 */
	async delete ( endpoint ) {
		return this._request( "DELETE", endpoint );
	}
	
	/**
	 * Internal method to make HTTP requests.
	 * @param {string} method - The HTTP method (GET, POST, PUT, PATCH, DELETE).
	 * @param {string} endpoint - The endpoint for the request.
	 * @param {Object} [data=null] - The data to be sent in the request.
	 * @param {Object} [queryParams={}] - The query parameters for the request.
	 * @returns {Object} The response data.
	 * @throws {Error} If the request fails.
	 * @private
	 */
	async _request ( method, endpoint, data = null, queryParams = {} ) {
		const url = this._buildUrl( endpoint, queryParams );
		const options = {
			method:             method,
			headers:            this._headers,
			muteHttpExceptions: true,
		};
		
		if ( data ) {
			options.payload = this._toUrlEncoded( data );
		}
		
		console.log( "_request - options:", options );
		
		try {
			const response = UrlFetchApp.fetch( url, options );
			const responseBody = JSON.parse( response.getContentText() );
			
			if ( response.getResponseCode() >= 200 && response.getResponseCode() < 300 ) {
				this._logger.log( `[LOG] Request successful: ${ JSON.stringify( responseBody ) }` );
				return responseBody;
			} else {
				throw new Error(
					`Request failed with status ${ response.getResponseCode() }: ${ responseBody.error
					                                                                ? responseBody.error.message
					                                                                : responseBody }`
				);
			}
		} catch ( error ) {
			this._logger.error( `[LOG] Error in API request: ${ error.message }` );
			throw error;
		}
	}
	
	/**
	 * Build the full URL with query parameters.
	 * @param {string} endpoint - The endpoint for the request.
	 * @param {Object} queryParams - The query parameters for the request.
	 * @returns {string} The full URL with query parameters.
	 * @private
	 */
	_buildUrl ( endpoint, queryParams ) {
		let url = `${ this._baseUrl }${ endpoint }`;
		const queryString = Object.keys( queryParams )
		                          .map( ( key ) => `${ encodeURIComponent( key ) }=${ encodeURIComponent( queryParams[key] ) }` )
		                          .join( "&" );
		if ( queryString ) {
			url += `?${ queryString }`;
		}
		return url;
	}
}

if ( typeof module !== "undefined" && module.exports ) {
	module.exports = API;
}
