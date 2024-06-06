/**
 * Class representing a dependency injector for managing service instances.
 */
class Injector
{
	constructor () {
		this.services = new Map();
	}
	
	/**
	 * Register a service with the injector.
	 * @param {string} name - The name of the service.
	 * @param {function} factory - The factory function to create the service instance.
	 */
	register ( name, factory ) {
		this.services.set( name, { factory } );
	}
	
	/**
	 * Get a service instance.
	 * @param {string} name - The name of the service to retrieve.
	 * @returns {Object} The service instance.
	 * @throws {Error} If the service is not found.
	 */
	get ( name ) {
		if ( !this.services.has( name ) ) {
			throw new Error( `Service not found: ${ name }` );
		}
		
		const serviceEntry = this.services.get( name );
		if ( !serviceEntry.instance ) {
			serviceEntry.instance = serviceEntry.factory( this );
		}
		return serviceEntry.instance;
	}
}

if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Injector;
}
