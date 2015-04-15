var express = require('express');
var forge = require('node-forge');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var http = require('http');
var app = express();

var service_config = {                                                                                   
    'host': 'blue-wave-28-192823.euw1-2.nitrousbox.com',                                                         
    'port': 5984,                                                                                       
    'path': '/jobs',                                                               
    'username': 'thepks',                                                                                  
    'password': ''                                                                   
}; 


var jsonParser = bodyParser.json();

var form_user_search = function(username) {
    return "/jobs/"+username;
};

var form_post_headers = function(username) {
    return {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(form_user_search(username), 'utf8'),
        'Authorization': 'Basic ' + new Buffer(service_config.username + ":" + service_config.password).toString('base64')
    };
};

var form_proxy_headers = function(body) {
    if (body === undefined) {
        return {
        'Authorization': 'Basic ' + new Buffer(service_config.username + ":" + service_config.password).toString('base64')
        };
    } else {
    return {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body, 'utf8'),
        'Authorization': 'Basic ' + new Buffer(service_config.username + ":" + service_config.password).toString('base64')
    };
    }
};


var form_proxy_options = function(method,url,body) {
    
    return {
        host: service_config.host,
        port: service_config.port,
        path: url,
        method: method,
        headers: form_proxy_headers(body)
    };
};

app.use(express.static('/home/action/jobs/'));

app.use(session({
    keys: ['flog1', '2flog', 'fl3og']
}));


app.get(/jobs/, function(req, res) {

    if (!req.session.auth) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return false;
    }

    // do the proxy call call
    var reqGet = http.request(form_proxy_options('GET',req.originalUrl), function(resembedded) {
        console.log("statusCode: ", resembedded.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);
        
        resembedded.pipe(res);

    });

    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
    });
});

app.put(/jobs/, jsonParser, function(req, res) {

    if (!req.session.auth) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return false;
    }
    
    var origBody = JSON.stringify(req.body);
    console.log(origBody);
    
    // do the POST call
    var reqPut = http.request(form_proxy_options('PUT',req.originalUrl,origBody), function(resembedded) {
        console.log("statusCode: ", resembedded.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);
        
        resembedded.pipe(res);
    
    });
    // write the json data
    reqPut.write(origBody);
    reqPut.end();
    
    reqPut.on('error', function(e) {
        console.error(e);
    });
});

app.delete(/jobs/, function(req, res) {

    if (!req.session.auth) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return false;
    }
    
    var origBody = JSON.stringify(req.body);
    console.log(origBody);
    
    // do the POST call
    var reqDel = http.request(form_proxy_options('DELETE',req.originalUrl), function(resembedded) {
        console.log("statusCode: ", resembedded.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);
        
        resembedded.pipe(res);
    
    });
    // write the json data

    reqDel.end();
    
    reqDel.on('error', function(e) {
        console.error(e);
    });
});

app.all('/action/logoff', function(req, res) {

    console.log('Logged on? ' + req.session.auth);
    req.session.auth = false;
    req.session.roles = [];
    res.statusCode = 200;
    res.send("Logged off");

});

        app.post('/action/logon', jsonParser, function(req, res) {
            var secret;
            var md = forge.md.sha1.create();
            md.update(req.body.user.password);
            secret = md.digest().toHex();
            console.log(secret);
            console.log(form_user_search(req.body.user.username));

            // do the call
            var reqGet = http.request(form_proxy_options('GET',form_user_search(req.body.user.username)), function(resembedded) {
                console.log("statusCode: ", resembedded.statusCode);
                // uncomment it for header details
                //  console.log("headers: ", res.headers);
        var data_comb ='';

                resembedded.on('data', function(d) {
            data_comb+=d;
        });

        resembedded.on('end', function() {
                    var result = {};
                    console.info('logon result:\n');
                    console.info('Get completed');
                    var p = JSON.parse(data_comb);
            console.log(data_comb);
                    try {
                        if (p.password === secret) {

                            result.authorised = true;
                            result.roles = p.roles.split(/,/g);
                            result.company = p.company;
                            
                            req.session.auth = true;
                            req.session.roles = result.roles;
                            req.session.company = result.company;
                            res.statusCode = 200;
                console.log(JSON.stringify(result));
                            res.send(JSON.stringify(result));
                        } else {
                            req.session.auth = false;
                            res.statusCode = 401;
                            result.authorised = false;
                            res.send(JSON.stringify(result));
                        }

                    } catch (e) {
                        console.log('Failed to find path');
                        req.session.auth = false;
                        req.session.roles = [];
                        res.statusCode = 401;
                        result.authorised = false;
                        res.send(JSON.stringify(result));
                    }


                });
            });

            // write the json data
            var posting = form_user_search(req.body.user.username);
            console.log(posting);
            reqGet.end();
            reqGet.on('error', function(e) {
                console.error(e);
            });

        });


        var server = app.listen(8080, function() {

            var host = server.address().address;
            var port = server.address().port;

            console.log('Server app listening at http://%s:%s', host, port);

        });

