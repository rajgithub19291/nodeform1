const express = require('express');
var path = require('path');
const app = express();
const database = require('./database/connect');
const port = process.env.PORT || 3500;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const Router = require('./routes/index.js'); 
app.use('/',Router);
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.listen(port,()=>{
    console.log(`App Run on port:localhost:${port}`);
});