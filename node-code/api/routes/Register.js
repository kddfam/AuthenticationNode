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
        .then(success(chalk.cyanBright.bold('Connected for Register route.')))
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

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const phonenumber = req.body.phonenumber;
    const password = req.body.password;

    const checkEmail = `SELECT * FROM users WHERE email = $1`
    const values = [email]
    pool.query(checkEmail,values)
        .then(result => {
            if(result.rowCount != 0) {
                failed(chalk.red.bold(`${email} Already Exists`))
                return res.status(400).json({
                    isSuccessful : false,
                    message : `${email} Already Exists`
                })
            }
            else {
                const newUser =  `INSERT INTO 
                                  users
                                  (firstname,lastname,email,phonenumber,password) 
                                  VALUES
                                  ($1,$2,$3,$4,$5)
                                  RETURNING
                                  id,firstname,lastname,email,phonenumber,password`
                const values1 = [firstname,lastname,email,phonenumber,password]
                pool.query(newUser,values1)
                    .then(response => {
                        const payload = response.rows[0]
                        const token = jwt.sign({payload}, config.get("jwtKey"))
                        return res.header('x-auth-token', token).status(200).json(response.rows[0])
                    })
                    .catch(reason => {
                        failed(chalk.red.bold(reason))
                        return res.status(400).json(reason)
                    })
            }
        })
        .catch(err => {
            failed(chalk.red.bold(err))
        });
})

function validateInputs(data) {
    const schema = joi.object({
        firstname : joi.string().required(),
        lastname : joi.string().required(),
        email : joi.string().required().email(),
        phonenumber : joi.number().required(),
        password : joi.string().required()
    });
    return schema.validate(data)
}

module.exports = router;
