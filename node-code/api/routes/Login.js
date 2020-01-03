const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const success = require('debug')('success');
const failed = require('debug')('failed');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const joi = require('@hapi/joi');
const {Pool} = require('pg');
const {error} = require('../logger/error.js');
const config = require('config');

router.post('/', async(req,res) => {

    // Postgres Connection
    const pool = new Pool({
        host : 'localhost',
        port : 5433,
        user : config.get("pg_user"),
        password : config.get("pg_password"),
        database : config.get("pg_database")
    });
    pool.connect()
        .then(success(chalk.cyanBright.bold('Connected for Login route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    const {validation_error} = validateInputs(req.body);
    if(validation_error) {
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });
        failed(chalk.red.bold(error.details[0].message)+chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }   
    
    const phonenumber = req.body.phonenumber;
    const password = req.body.password;

    const checkPhoneNumber = `SELECT * FROM users WHERE phonenumber = $1 AND password = $2`
    const values = [phonenumber,password]

    pool.query(checkPhoneNumber,values)
        .then(result => {
            if(result.rowCount == 0) {
                failed(chalk.red.bold(`${phonenumber} Not Found`))
                return res.status(400).json({
                    isSuccessful : false,
                    message : `${phonenumber} Not Found`
                });
            }
            else {
                if(result.rows[0].password == password) {
                    success(chalk.green.bold('Welcome Back'))
                    return res.status(200).json({
                        isSuccessful : true,
                        message : `Welcome ${result.rows[0].firstname}`
                    });
                }
                else {
                    failed(chalk.red.bold('Password Does not match'))
                    return res.status(400).json({
                        isSuccessful : false,
                        message : 'Password Does not match'
                    });
                }
            }
        })
        .catch(err => {
            failed(chalk.red.bold(err));
            return res.status(400).json(err);
        })
    
})

function validateInputs(data) {
    const schema = joi.object({
        phonenumber : joi.number().required(),
        password : joi.string().required()
    });
    return schema.validate(data)
}

module.exports = router;
