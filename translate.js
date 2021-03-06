#!/usr/bin/env node


const fs = require('fs');
var http = require('http');

// When you have your own Client ID and secret, put down their values here:
var clientId = "FREE_TRIAL_ACCOUNT";
var clientSecret = "PUBLIC_SECRET";

//

// var lineReader = require('readline').createInterface({
//   input: require('fs').createReadStream('data/en.txt')
// });

// lineReader.on('line', function (line) {
//   console.log('Line from file:', line);
// });

// TODO: Specify your translation requirements here:
var fromLang = "en";
var toLang = "km";
var text = "Hello, how are you?";

var jsonPayload = JSON.stringify({
    fromLang: fromLang,
    toLang: toLang,
    text: text
});

var options = {
    hostname: "api.whatsmate.net",
    port: 80,
    path: "/v1/translation/translate",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-WM-CLIENT-ID": clientId,
        "X-WM-CLIENT-SECRET": clientSecret,
        "Content-Length": Buffer.byteLength(jsonPayload)
    }
};

var request = new http.ClientRequest(options);
request.end(jsonPayload);

request.on('response', function (response) {
    console.log('Status code: ' + response.statusCode);
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
        console.log('Translated text:');
        console.log(chunk);         
    });
});



// Ref:
// http://www.cs.cmu.edu/~ark/QA-data/