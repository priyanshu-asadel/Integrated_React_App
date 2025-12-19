var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');


module.exports = (app)=>{
	// view engine setup
	app.set('views', path.resolve('./views'));
    app.set('view engine', 'ejs');
    app.use(logger('dev'));
    app.use(express.json({limit: '50mb'}));
    app.use(express.urlencoded({
        limit: '50mb',
        extended: true
    }));
    app.use(cookieParser());
    app.use(express.static(path.resolve('./public')));
    app.use(favicon(path.resolve('./public/images/favicon.ico')));
}