// content of index.js
const http = require('http');
const fs = require('fs');
const port = 3000

const requestHandler = (request, response) => {
    console.log(request.url)
    response.writeHeader(200, { "Content-Type": "text/html" });
    
    var html = fs.readFileSync('./index.html');
    response.write(html);
    response.end();  
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})