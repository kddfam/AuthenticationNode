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

    const email = req.body.email;

    const checkEmail = `SELECT * FROM users WHERE email = $1`
    const values = [email]

    pool.query(checkEmail,values)
        .then(result => {
            if (result.rowCount == 0) {
                failed(chalk.red.bold(`${email} does not exists`))
                error.log({
                    level : "error",
                    message : `${email} does not exists`
                });
                return res.status(400).json({
                    isSuccessful : false,
                    message : `${email} does not exists`
                });
            }
            else {
                const otp = generateOTP();
                const insertOTP = 'INSERT INTO otps(opt,userid) VALUES($1,$2)'
                const values1 = [otp, result.rows[0].id]

                pool.query(insertOTP,values1)
                    .then(response => {
                        success(chalk.green.bold(`OTP ${otp} generated for ${result.rows[0].firstname}`));
                        return res.status(200).json({
                            isSuccessful : true,
                            message : otp
                        });
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
})

function validateInputs(data) {
    const schema = joi.object({
        email : joi.string().email().required()
    });
    return schema.validate(data)
}

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
