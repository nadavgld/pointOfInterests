//Requires
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var jwt = require('jsonwebtoken');

app.use(cors());
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static('public'));

//DB Util import
var dbUtil = require('./DButils');

// Modules Import
var Points = require('./modules/PointOI');
var Category = require('./modules/Category');
var User = require('./modules/User');
var Token = require('./modules/Token');

app.use('/user', User);
app.use('/point', Points);
app.use('/category', Category);

// Web-Statistics
app.get('/statistics/views_agg/:agg', (req, res) => {
    var agg = req.params.agg;
    dbUtil.execQuery("select " + agg + "(views) as views,b.name from points a join categories b on a.category_id=b.id group by b.name")
        .then((response) => {
            res.send(response)
        }).catch(() => res.sendStatus(300))
})

app.get('/statistics/views_percentile/:percent', (req, res) => {
    var percent = req.params.percent;
    dbUtil.execQuery(`
        select max(a.per9) as views,a.name
        from 
        (select PERCENTILE_disc(${percent}) WITHIN GROUP (ORDER BY views) OVER (PARTITION BY category_id) as per9,b.name from points a join categories b on a.category_id=b.id) a 
        group by a.name
    `)
        .then((response) => {
            res.send(response)
        }).catch(() => res.sendStatus(300))
})

app.get('/statistics/review_length/users', (req, res) => {
    dbUtil.execQuery(`
        select avg(DataLength(description)) as description_length ,b.username from reviews a join users b on a.u_id=b.id group by b.username
        `)
        .then((response) => {
            res.send(response)
        }).catch(() => res.sendStatus(300))
})

app.get('/statistics/review_length/points', (req, res) => {
    dbUtil.execQuery(`
        select avg(DataLength(a.description)) as description_length ,b.name from reviews a join points b on a.p_id=b.id group by b.name
        `)
        .then((response) => {
            res.send(response)
        }).catch(() => res.sendStatus(300))
})

app.get('/statistics/time/:table/:field', (req, res) => {
    var field = req.params.field;
    var table = req.params.table;
    dbUtil.execQuery(`
        SELECT count(DATEPART(HOUR, ${field})) as count, DATEPART(HOUR, ${field}) as hour from ${table} group by DATEPART(HOUR, ${field})
        `)
        .then((response) => {
            res.send(response)
        }).catch(() => res.sendStatus(300))
})

app.listen(PORT, () => { console.log(`listening to ${PORT}`) })