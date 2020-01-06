const mongoose = require('mongoose');
const success = require('debug')('success');
const failed = require('debug')('failed');
const chalk = require('chalk');

// function for mongodb connection
module.exports = function () {
    mongoose.connect('mongodb://localhost/authentication',
        {
            useCreateIndex : true,
            useFindAndModify : true,
            useNewUrlParser : true,
            useUnifiedTopology : true
        }).then(suc => success(chalk.cyanBright.bold('Connected to MongoDB')))
          .catch(error => failed(chalk.redBright.bold(error)))
};
