const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/TestDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection Successful");
}).catch((e) => { 
    console.log("No connections");
});