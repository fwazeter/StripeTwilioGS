/**
 * Logger utility class for logging messages.
 */
class Logger
{
	/**
	 * Log a generic message.
	 * @param {string} message - The message to log.
	 */
	log ( message ) {
		console.log( `[LOG] ${ message }` );
	}
	
	/**
	 * Log an informational message.
	 * @param {string} message - The message to log.
	 */
	info ( message ) {
		console.info( `[INFO] ${ message }` );
	}
	
	/**
	 * Log an error message.
	 * @param {string} message - The message to log.
	 */
	error ( message ) {
		console.error( `[ERROR] ${ message }` );
	}
}

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = Logger;
}
