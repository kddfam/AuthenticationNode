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

    // connecting to postgres
    pool.connect()
        .then(success(chalk.cyanBright.bold('Connected for Login route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    // validating values entered by user
    const {validation_error} = validateInputs(req.body);
    if(validation_error) {

        // log error in file
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });

        // display error message on console
        failed(chalk.red.bold(error.details[0].message)+chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));

        // return response to user
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }   
    
    // getting values from request's body
    const phonenumber = req.body.phonenumber;
    const password = req.body.password;

    // database query
    const checkPhoneNumberQuery = `SELECT * FROM users WHERE phonenumber = $1 AND password = $2`
    const checkPhoneNumberValues = [phonenumber,password]

    // firing database query
    pool.query(checkPhoneNumberQuery,checkPhoneNumberValues)
        .then(result => {
            // checking whether phone number exists or not

            // if not exists
            if(result.rowCount == 0) {

                // display message on console
                failed(chalk.red.bold(`${phonenumber} Not Found`))

                // return response to user
                return res.status(400).json({
                    isSuccessful : false,
                    message : `${phonenumber} Not Found`
                });
            }

            // if exists
            else {

                // matching password
                if(result.rows[0].password == password) {

                    // if match, display success message on console
                    success(chalk.green.bold('Welcome Back'))

                    // return response to user
                    return res.status(200).json({
                        isSuccessful : true,
                        message : `Welcome ${result.rows[0].firstname}`
                    });
                }
                else {

                    // if dont match, display error message on console
                    failed(chalk.red.bold('Password Does not match'))

                    // return response to user
                    return res.status(400).json({
                        isSuccessful : false,
                        message : 'Password Does not match'
                    });
                }
            }
        })
        .catch(err => {

            // display error on console
            failed(chalk.red.bold(err));

            // return response to user
            return res.status(400).json(err);
        })
    
})

// function for validating user input values
function validateInputs(data) {
    const schema = joi.object({
        phonenumber : joi.number().required(),
        password : joi.string().required()
    });
    return schema.validate(data)
}

module.exports = router;
