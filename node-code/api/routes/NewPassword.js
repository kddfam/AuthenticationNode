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
    pool.connect()
        .then(success(chalk.cyanBright.bold('Connected for Forgot Password route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    const {validation_error} = validateInputs(req.body);
    if(validation_error) {
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });
        failed(chalk.red.bold(error.details[0].message) +' '+ chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }

    const id = req.body.id
    const password = req.body.password

    const checkId = `SELECT * FROM users WHERE id=$1`
    const value = [id]

    pool.query(checkId,value)
        .then(result => {
            if (result.rowCount == 0) {
                failed(chalk.red.bold('Error Occured'))
                error.log({
                    level : 'error',
                    message : 'Error Occured',
                    time : mongoose.Types.ObjectId().getTimestamp()
                })
                return res.status(400).json({
                    isSuccessful : false,
                    message : 'Error Occured'
                })
            }
            else {
                const updatePassword = `UPDATE users SET password=$1 WHERE id=$2`
                const value1 = [password,id]

                pool.query(updatePassword,value1)
                    .then(response => {
                        success(chalk.green.bold('Password Updated'))
                        return res.status(200).json({
                            isSuccessful : true,
                            message : 'Password Updated SUccessfully'
                        })
                    })
                    .catch(err => {
                        failed(chalk.red.bold(err))
                        return res.status(400).json({
                            isSuccessful : false,
                            message : err
                        })
                    })
            }
        })
        .catch(errror => {
            failed(chalk.red.bold(errror))
            return res.status(400).json({
                isSuccessful : false,
                message : errror
            })
        })

})

function validateInputs(data) {
    const schema = joi.object({
        id : joi.number().required(),
        password : joi.string().required()
    });
    return schema.validate(data)
}

module.exports = router
