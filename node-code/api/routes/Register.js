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
        .then(success(chalk.cyanBright.bold('Connected for Register route.')))
        .catch(err => failed(chalk.redBright.bold(err)));

    // validating user input
    const {validation_error} = validateInputs(req.body);
    if(validation_error) {

        // logging into log file
        error.log({
            level : 'error',
            message : error.details[0].message,
            time : mongoose.Types.ObjectId().getTimestamp()
        });

        // display error on console
        failed(chalk.red.bold(error.details[0].message)+chalk.blue.bold(mongoose.Types.ObjectId().getTimestamp()));

        // return error response to user
        return res.status(500).json({
            isSuccessful : false,
            message : error.details[0].message
        });
    }

    // getting values from request body
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const phonenumber = req.body.phonenumber;
    const password = req.body.password;

    // database query
    const checkEmailQuery = `SELECT * FROM users WHERE email = $1`
    const emailValue = [email]

    // firing database query
    pool.query(checkEmailQuery,emailValue)
        .then(result => {
            // checking whether email already exists or not
            // if email already exists
            if(result.rowCount != 0) {

                // display error message on console
                failed(chalk.red.bold(`${email} Already Exists`))

                // return error response to the user
                return res.status(400).json({
                    isSuccessful : false,
                    message : `${email} Already Exists`
                })
            }

            // if not
            else {

                // database query
                const newUserQuery =  `INSERT INTO 
                                  users
                                  (firstname,lastname,email,phonenumber,password) 
                                  VALUES
                                  ($1,$2,$3,$4,$5)
                                  RETURNING
                                  id,firstname,lastname,email,phonenumber,password`
                const newUserValues = [firstname,lastname,email,phonenumber,password]

                // firing query
                pool.query(newUserQuery,newUserValues)
                    .then(response => {

                        // generating token
                        const payload = response.rows[0]
                        const token = jwt.sign({payload}, config.get("jwtKey"))

                        // returning reponse to the user request
                        return res.header('x-auth-token', token).status(200).json(response.rows[0])
                    })
                    .catch(err => {

                        // display error message on console
                        failed(chalk.red.bold(err))

                        // return response to user request
                        return res.status(400).json(err)
                    })
            }
        })
        .catch(error => {

            // display error on console
            failed(chalk.red.bold(error))

            // return response to user
            return res.status(400).json({
                isSuccessful : false,
                message : error
            })
        });
})

// function for validating user inputs
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
