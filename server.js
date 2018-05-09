var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');

app.use(cors());
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var dbUtil = require('./DButils');

var insertTomSql = function(){
    dbUtil.execQuery("INSERT INTO [users] ([LastName],[FirstName],[City]) VALUES ('grinberg','nadav','haifa')")
    .then((res)=>{
        console.log(res);
        selectAll("users");
    })
    .catch((err)=>{
        console.log(err);
    })
}

var selectAll = function(table){
    
    dbUtil.execQuery('select * from ' + table)
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
}

selectAll("users");
// insertTomSql();

app.listen(PORT, ()=>{console.log(`listening to ${PORT}`)})