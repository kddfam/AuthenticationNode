const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const success = require('debug')('success');
const failed = require('debug')('failed');
const chalk = require('chalk');
const joi = require('@hapi/joi');
const {Pool} = require('pg');
const {error} = require('../logger/error.js');
const config = require('config');
const rn = require('random-number');

router.post('/', async(req,res) => {

    // Postgres Connection
    const pool = new Pool({
        host : 'localhost',
        port : 5433,
        user : config.get("pg_user"),
        password : config.get("pg_password"),
        database : config.get("pg_database")
    });

    // Connecting to postgres
    pool.connect()
        .then(success(chalk.cyanBright.bold('Connected for Forgot Password route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    // Validating input values
    const {validation_error} = validateInputs(req.body);
    if(validation_error) {

        // logging error in log file
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });

        // display error message on console
        failed(chalk.red.bold(error.details[0].message) +' '+ chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));

        // returning error response to the user
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }

    // getting value of email from request body
    const email = req.body.email;

    // database query and value
    const checkEmailQuery = `SELECT * FROM users WHERE email = $1`
    const emailValue = [email]

    // firing the query
    pool.query(checkEmailQuery,emailValue)
        .then(result => {
            // checking whether the email exists or not

            // if not exists
            if (result.rowCount == 0) {

                // display message on console
                failed(chalk.red.bold(`${email} does not exists`))

                // log error in log file
                error.log({
                    level : "error",
                    message : `${email} does not exists`
                });

                // return error response to user
                return res.status(400).json({
                    isSuccessful : false,
                    message : `${email} does not exists`
                });
            }

            // if exists
            else {
                // generating otp
                const otp = generateOTP();

                // database query
                const insertOTPQuery = 'INSERT INTO otps(opt,userid) VALUES($1,$2)'
                const otpValues = [otp, result.rows[0].id]

                // firing query
                pool.query(insertOTPQuery,otpValues)
                    .then(response => {

                        // display success message on console
                        success(chalk.green.bold(`OTP ${otp} generated for ${result.rows[0].firstname}`));

                        // return response to user
                        return res.status(200).json({
                            isSuccessful : true,
                            message : otp
                        });
                    })
                    .catch(err => {

                        // in case if error occured, display error on console
                        failed(chalk.red.bold(err))

                        // return response as a error to the user
                        return res.status(400).json({
                            isSuccessful : false,
                            message : err
                        })
                    })
            }
        })
        // catch error occured in the main query
        .catch(error => {

            // display error on console
            failed(chalk.red.bold(error))
            
            // return error response to the user
            return res.status(400).json({
                isSuccessful : false,
                message : error
            })
        })
})

// function for validating user inputs
function validateInputs(data) {
    const schema = joi.object({
        email : joi.string().email().required()
    });
    return schema.validate(data)
}

// function for generating random number that can be used as an otp
function generateOTP() {
    const rngen = rn.generator({
        min : 000001,
        max : 999999,
        integer : true
    });
    const otp = rngen();
    return otp;
}

module.exports = router;
