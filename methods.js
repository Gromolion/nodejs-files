const querystring = require("querystring");

const METHOD_GET = 'GET';
module.exports.METHOD_GET = METHOD_GET;
const METHOD_POST = 'POST';
module.exports.METHOD_POST = METHOD_POST;

module.exports.get = function(request, response, callback) {
    if (request.method !== METHOD_GET) methodNotAllowed(response);
    else callback();
}

module.exports.post = function(request, response, callback) {
    if (request.method !== METHOD_POST) methodNotAllowed(response);
    else getPostData(request, response, callback);
}

module.exports.all = function(request, response, callback) {
    getPostData(request, response, callback);
}

function getPostData(request, response, callback) {
    let rawData = '';

    request.on('data', function (data) {
        rawData += data;
        if (data.length > 1e6) {
            rawData = '';
            response.statusCode = 413;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.end('Payload too large');
            request.connection.destroy();
        }
    });

    request.on('end', () => {
        callback(querystring.decode(rawData));
    });
}

function methodNotAllowed(response) {
    response.statusCode = 405;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('Method Not Allowed');
}