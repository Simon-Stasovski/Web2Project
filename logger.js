/**
 * Sets up the logging to a log file with pino.
 */

const pino = require( 'pino' );

const logger = pino({
    level: 'info'
},
    pino.destination( 'logs/server-log' )
);

module.exports = logger;
