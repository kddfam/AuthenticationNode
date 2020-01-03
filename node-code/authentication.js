const express = require('express');
const app = express();
const success = require('debug')('success');
const failed = require('debug')('failed');
const chalk = require('chalk');
const config = require('config');

if(!config.get("pg_user") && !config.get("pg_password") && !config.get("pg_database")) {
    failed(chalk.blueBright.bold('Postgres Infomation Missing'));
    process.exit(1);
};

require('./api/ini/mdb.js')();
require('./api/ini/route.js')(app);

const port = process.env.port || 1234;
app.listen(port, () => {
    success(chalk.cyanBright.bold(`Listening to ${port}`));
});
