const express = require('express');
const Register = require('../routes/Register.js');
const Login = require('../routes/Login.js');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({extended : true}));
    app.use('/api/register', Register);
    app.use('/api/login', Login);
};
