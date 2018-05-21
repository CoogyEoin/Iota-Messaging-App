var express = require('express');
var bodyParser = require('body-parser');
var Mam = require('./lib/mam.node.js');
const IOTA = require('iota.lib.js')
const iota = new IOTA({
    host: 'https://node.iota-tangle.io',
    port: 14265
})

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/index.html', function(req, res) {
        res.sendFile(__dirname + "/" + "index.html");
});

app.post('/MAM', urlencodedParser, function(req, res){


response = {
    sidekey : req.body.sidekey,
    message: req.body.message
};

const msg = response.message;
const key = response.sidekey;
    
console.log(response);
        
//convert the response in JSON format
res.end(JSON.stringify(response));
    
let mamState = Mam.init(iota)

mamState = Mam.changeMode(mamState, 'restricted', key)
// Publish to tangle
const publish = async packet => {
    // Create MAM Payload - STRING OF TRYTES
    const trytes = iota.utils.toTrytes(JSON.stringify(packet))
    const message = Mam.create(mamState, trytes)
    // Save new mamState
    mamState = message.state
    console.log('Root: ', message.root)
    console.log('Address: ', message.address)
    
    // Attach the payload.
    await Mam.attach(message.payload, message.address)
    
    const logData = trytes => console.log(JSON.parse(iota.utils.fromTrytes(trytes)))
    
    // Fetch Stream Async to Test
    const resp = await Mam.fetch(message.root,'restricted', key, logData)
    console.log(resp)
}

publish(msg);
});

var server = app.listen(8080, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});



