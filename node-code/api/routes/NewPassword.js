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
        .then(success(chalk.cyanBright.bold('Connected for Forgot Password route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    // validating user input values
    const {validation_error} = validateInputs(req.body);
    if(validation_error) {

        // logging error into log file
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });

        // listing result onto console
        failed(chalk.red.bold(error.details[0].message) +' '+ chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));

        // returning result to user as a response
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }

    // getting values from request's body
    const id = req.body.id
    const password = req.body.password

    // database query
    const checkIdQuery = `SELECT * FROM users WHERE id=$1`
    const idValue = [id]

    // firing database query
    pool.query(checkIdQuery,idValue)
        .then(result => {
            // checking whether the result row count equals to zero or not

            // if zero
            if (result.rowCount == 0) {

                // message display on console 
                failed(chalk.red.bold('Error Occured'))

                // logging error
                error.log({
                    level : 'error',
                    message : 'Error Occured',
                    time : mongoose.Types.ObjectId().getTimestamp()
                })

                // return response to user request
                return res.status(400).json({
                    isSuccessful : false,
                    message : 'Error Occured'
                })
            }
            // if not zero
            else {
                // getting new password from request body
                const updatePasswordQuery = `UPDATE users SET password=$1 WHERE id=$2`
                const updatePasswordValues = [password,id]

                // firing database query
                pool.query(updatePasswordQuery,updatePasswordValues)
                    .then(response => {

                        // message display on console
                        success(chalk.green.bold('Password Updated'))

                        // returning response to user
                        return res.status(200).json({
                            isSuccessful : true,
                            message : 'Password Updated SUccessfully'
                        })
                    })
                    // sub query catch which will catch the error if occured
                    .catch(err => {

                        // display error on console
                        failed(chalk.red.bold(err))

                        // returning error as a response to the user
                        return res.status(400).json({
                            isSuccessful : false,
                            message : err
                        })
                    })
            }
        })
        // catching the main query error
        .catch(error => {

            // display error on console
            failed(chalk.red.bold(error))
            
            // returning error to the user as response
            return res.status(400).json({
                isSuccessful : false,
                message : error
            })
        })

})

// function for validating user input values
function validateInputs(data) {
    const schema = joi.object({
        id : joi.number().required(),
        password : joi.string().required()
    });
    return schema.validate(data)
}

module.exports = router
