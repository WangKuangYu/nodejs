const http = require('http');
const server = http.createServer((request, response)=>{
response.writeHead(200, {
'Content-Type': 'text/html'
});
response.end(`<div>Hello 123<br>
${request.url}
</div>`);
});
server.listen(3000);