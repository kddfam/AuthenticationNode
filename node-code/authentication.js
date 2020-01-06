const express = require('express');
const app = express();
const success = require('debug')('success');
const failed = require('debug')('failed');
const chalk = require('chalk');
const config = require('config');

if(!config.get("pg_user")) {
    failed(chalk.blueBright.bold('Postgres User Missing'));
    process.exit(1);
};

if(!config.get("pg_password")) {
    failed(chalk.blueBright.bold('Postgres Password Missing'));
    process.exit(1);
}

if(!config.get("pg_database")) {
    failed(chalk.blueBright.bold('Postgres Database Missing'));
    process.exit(1);
}

if(!config.get("jwtKey")) {
    failed(chalk.blueBright.bold('JWT Key Missing'))
    process.exit(1)
};

require('./api/ini/mdb.js')();
require('./api/ini/route.js')(app);

const port = process.env.port || 1234;
app.listen(port, () => {
    success(chalk.cyanBright.bold(`Listening to ${port}`));
});
