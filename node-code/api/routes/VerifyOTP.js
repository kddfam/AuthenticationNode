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
        .then(success(chalk.cyanBright.bold('Connected for Verify OTP route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    // validating user input
    const {validation_error} = validateInputs(req.body);
    if(validation_error) {

        // logging error
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });

        // display error on console 
        failed(chalk.red.bold(error.details[0].message) +' '+ chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));

        // return response to user
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }

    // getting values from request body
    const otp = req.body.otp;

    // database query
    const verifyOTPQuery = 'SELECT * FROM otps WHERE opt = $1'
    const verifyOTPValue = [otp]

    // firing query
    pool.query(verifyOTPQuery, verifyOTPValue)
        .then(result => {
            // checking whether entered otp match or not

            // if matches, update value of status from false to true 
            if (result.rows[0].opt == otp) {

                // database query
                const statusUpdateQuery = `UPDATE otps SET status = true WHERE id = $1`
                const value1 = [result.rows[0].id]

                // firing query
                pool.query(statusUpdate,value1)
                    .then(response => {

                        // success message on console
                        success(chalk.green.bold('OTP Verified'))

                        // returing response to user
                        return res.status(200).json({
                            isSuccessful : true,
                            message : 'OTP Verified'
                        })
                    })
                    .catch(err => {
                        
                        // failed error message on console
                        failed(chalk.red.bold(err))

                        // return response to user
                        return res.status(400).json({
                            isSuccessful : true,
                            message : err
                        })
                    })
            }
        })

})

// function for validating inputs
function validateInputs(data) {
    const schema = joi.object({
        otp : joi.number().required()
    });
    return schema.validate(data)
}

module.exports = router;
