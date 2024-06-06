/**
 * Setup and configure the dependency injector with services.
 * @returns {Injector} The configured injector.
 */
function setupInjector () {
	const injector = new Injector();
	
	// Registering the Logger service
	injector.register( 'Logger', () => new Logger() );
	
	// Registering the Validator service
	injector.register( 'Validator', () => new ValidationUtility() );
	
	// Registering the API service for Stripe
	injector.register( 'StripeAPI', ( injector ) => {
		const config = {
			apiKeySid: Config.STRIPE_API_KEY,
			baseUrl:   Config.BASE_STRIPE_URL,
		};
		const logger = injector.get( 'Logger' );
		return new API( config, logger );
	} );
	
	// Registering the CustomerService
	injector.register( 'CustomerService', ( injector ) => {
		const api = injector.get( 'StripeAPI' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new CustomerService( api, validator, logger );
	} );
	
	// Registering the InvoiceService
	injector.register( 'InvoiceService', ( injector ) => {
		const api = injector.get( 'StripeAPI' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new InvoiceService( api, validator, logger );
	} );
	
	// Registering the API service for Twilio
	injector.register( 'TwilioAPI', ( injector ) => {
		const config = {
			apiKeySid:    Config.TWILIO_API_KEY_SID,
			apiKeySecret: Config.TWILIO_API_KEY_SECRET,
			baseUrl:      Config.BASE_TWILIO_URL
		};
		const logger = injector.get( 'Logger' );
		return new API( config, logger );
	} );
	
	// Registering the MessageService
	injector.register( 'MessageService', ( injector ) => {
		const api = injector.get( 'TwilioAPI' );
		const validator = injector.get( 'Validator' );
		const logger = injector.get( 'Logger' );
		return new MessageService( api, validator, logger );
	} );
	
	return injector;
}

// Initialize the injector
const injector = setupInjector();
