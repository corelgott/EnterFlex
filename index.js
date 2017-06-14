var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var readline = require('readline');

var storage = require('./storage');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    var time = new Date().getTime();
    storage.get(line).then(res => {
        console.log(res);
    });
});

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/all', (req, res) => {
    storage.getAll().then(docs => {
        res.json(docs);
    });
});

app.get('/remove/:id', (req, res) => {
    var id = req.params.id;

    console.log('remove ' + id);
    if (!id) { res.json({ status : 'error', msg : 'invalid id'}); return }

    storage.delete(id)
        .then(resp => { res.json({ status : 'success', data : resp  }) })
        .catch(res.json);
});

app.post('/register', (req, res) => {
    var info = req.body;
    console.log('register ' + JSON.stringify(info));
    storage.register(info.name, info.hash, info.token, info.iv).then(function(doc) {
        res.json({ status : 'success', doc });
    }).catch((err) => {
        res.json({ status : 'error', msg : err})
    });
});

var srv = app.listen(8080, function() {
    console.log('listening on ' + srv.address().port);
});