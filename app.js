const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');
const http_utils = require('./http_utils');
const methods = require('./methods')
const path = require("path");

dotenv.config();

const host = process.env.APP_HOST;
const port = process.env.APP_PORT;

const server = http.createServer((req, res) => {
    switch (req.url) {
        case '/':
            methods.all(req, res, (postData) => {
                if (req.method === methods.METHOD_GET) {
                    http_utils.sendHtml(res, 'views/index.html');
                } else {
                    if (postData.title && postData.content && postData.ext) {
                        fs.writeFile(`uploaded/${postData.title}.${postData.ext}`, postData.content, function (err) {
                            if (err) throw err;
                        });
                        http_utils.sendHtml(res, "views/add.html");
                    } else http_utils.sendHtml(res, "views/incorrect.html");
                }
            });
            break;
        case '/get':
            methods.get(req, res, () => {
                let fileArray = [];
                let files = fs.readdirSync('./uploaded', {withFileTypes: true});

                files.forEach(file => {
                    fileArray.push(`<option value="${file.name}">${file.name}</option>`);

                });

                http_utils.sendParsedHtml(res, 'views/get.html', {
                    files: fileArray.join('\n')
                });
            });
            break;
        case '/file':
                methods.post(req, res, (postData) => {
                    if (postData.title) {
                        let content = fs.readFileSync(`uploaded/${postData.title}`);
                        http_utils.sendParsedHtml(res, 'views/file.html', {
                            fileName: postData.title,
                            fileContent: content
                        });
                    } else http_utils.sendHtml(res, "views/incorrect.html");
                });
                break;
        case '/update-form':
            methods.post(req, res, (postData) => {
                if (postData.name) {
                    let content = fs.readFileSync(`uploaded/${postData.name}`);
                    let ext = path.extname(postData.name);
                    let title = path.basename(postData.name, ext);
                    http_utils.sendParsedHtml(res, 'views/update-form.html', {
                        title: title,
                        content: content,
                        ext: ext.replace('.', '')
                    });
                } else http_utils.sendHtml(res, "views/incorrect.html");
            });
            break;
        case '/update':
            methods.post(req, res, (postData) => {
                if (postData.oldTitle && postData.title && postData.content && postData.ext) {
                    fs.unlinkSync(`uploaded/${postData.oldTitle}.${postData.ext}`);
                    fs.writeFile(`uploaded/${postData.title}.${postData.ext}`, postData.content, function (err) {
                        if (err) throw err;
                    });
                    http_utils.sendHtml(res, "views/update.html");
                } else http_utils.sendHtml(res, "views/incorrect.html");
            });
            break;
        case '/delete':
            methods.post(req, res, (postData) => {
                fs.unlinkSync(`uploaded/${postData.name}`);

                http_utils.sendHtml(res, "views/delete.html");
            });
            break;
        default:
            http_utils.notFound(res);
            break;
    }
});

server.listen(port, host, () => {
    console.log(`Сервер запущен на http://${host}:${port}`);
});