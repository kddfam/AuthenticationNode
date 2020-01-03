const express = require('express');
const Register = require('../routes/Register.js');
const Login = require('../routes/Login.js');
const ForgotPassword = require('../routes/ForgotPassword.js');
const VerifyOTP = require('../routes/VerifyOTP.js');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({extended : true}));
    app.use('/api/register', Register)
    app.use('/api/login', Login);
    app.use('/api/fp', ForgotPassword);
    app.use('/api/vo', VerifyOTP);
};
