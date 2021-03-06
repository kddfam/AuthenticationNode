const express = require('express');
const Register = require('../routes/Register.js');
const Login = require('../routes/Login.js');
const ForgotPassword = require('../routes/ForgotPassword.js');
const VerifyOTP = require('../routes/VerifyOTP.js');
const NewPassword = require('../routes/NewPassword.js');

// function for defining various routes
module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({extended : true}));
    app.use('/api/register', Register)
    app.use('/api/login', Login);
    app.use('/api/fp', ForgotPassword);
    app.use('/api/vo', VerifyOTP);
    app.use('/api/np', NewPassword);
};
