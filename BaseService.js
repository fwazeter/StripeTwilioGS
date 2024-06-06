/**
 * Class representing a base service for handling common service operations.
 */
class BaseService
{
	/**
	 * Create a BaseService.
	 * @param {API} api - The API client instance.
	 * @param {ValidationUtility} validator - Validation class instance.
	 * @param {Logger} logger - Error and message logger class.
	 */
	constructor ( api, validator, logger ) {
		this.api = api;
		this.validator = validator;
		this.logger = logger;
	}
	
	/**
	 * Handle API requests with common error handling and logging.
	 * @param {function} requestFunction - The request function to execute.
	 * @param {string} operation - Description of the operation being performed.
	 * @returns {Object} The response data.
	 * @throws {Error} If the request fails.
	 */
	async handleRequest ( requestFunction, operation ) {
		try {
			const response = await requestFunction();
			this.logger.log( `${ operation } successful: ${ JSON.stringify( response ) }` );
			return response;
		} catch ( error ) {
			this.logger.error( `Error during ${ operation }: ${ error.message }` );
			throw error;
		}
	}
}

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = BaseService;
}
