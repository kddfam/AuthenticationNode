const express = require('express');
const Register = require('../routes/Register.js');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({extended : true}));
    app.use('/api/register', Register)
};
