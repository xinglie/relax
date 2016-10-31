var http = require('http');
var relax = require('../index');
var serveStatic = require('serve-static')(__dirname + '/publish/client/');
relax.config({
    views: __dirname + '/',
    routes: {
        '/': 'app/views/default'
    }
});
http.createServer(function(request, response) {
    serveStatic(request, response, function() {
        relax(request, response, function(e) {
            response.writeHeader(e.code, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            response.end(e.html);
        });
    });
}).listen(7000);