const logger = require('winston');
require('winston-mongodb');

// logger function
const error = logger.createLogger({
    format : logger.format.json(),
    transports : [
        new logger.transports.File({
            filename : './logs/error.log'
        })
    ]
});

exports.error = error;
