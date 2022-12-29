const fs = require('fs');

module.exports.sendText = function(response, text) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(text);
}

module.exports.sendHtml = function (response, filePath) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    let file = fs.createReadStream(filePath);
    file.pipe(response);
}

module.exports.sendParsedHtml = function (response, filePath, params) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    let file = fs.createReadStream(filePath);
    const chunks = [];

    file.on("data", function (chunk) {
        chunks.push(chunk);
    });

    file.on("end", function () {
        let content = Buffer.concat(chunks).toString('utf-8');
        Object.entries(params).forEach(([key, value]) => {
            content = content.split(`{{${key}}}`).join(value);
        });
        response.end(content);
    });
}

module.exports.notFound = function(response) {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('Страница не найдена');
}
