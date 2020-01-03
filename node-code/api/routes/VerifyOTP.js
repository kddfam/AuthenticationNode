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
        .then(success(chalk.cyanBright.bold('Connected for Verify OTP route.')))
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

    const otp = req.body.otp;

    const verifyOTP = 'SELECT * FROM otps WHERE opt = $1'
    const value = [otp]

    pool.query(verifyOTP, value)
        .then(result => {
            if (result.rows[0].opt == otp) {
                const statusUpdate = `UPDATE otps SET status = true WHERE id = $1`
                const value1 = [result.rows[0].id]

                pool.query(statusUpdate,value1)
                    .then(response => {
                        success(chalk.green.bold('OTP Verified'))
                        return res.status(200).json({
                            isSuccessful : true,
                            message : 'OTP Verified'
                        })
                    })
                    .catch(err => {
                        success(chalk.red.bold(err))
                        return res.status(400).json({
                            isSuccessful : true,
                            message : err
                        })
                    })
            }
        })

})

function validateInputs(data) {
    const schema = joi.object({
        otp : joi.number().required()
    });
    return schema.validate(data)
}

module.exports = router;
