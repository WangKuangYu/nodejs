const http = require('http');
const fs = require("fs");
const server = http.createServer((request, response)=>{

    fs.writeFile("./header01.json",JSON.stringify(request.headers),error=>{
        // response.end("ok");
        fs.readFile("./abc.html",(error,data)=>{response.end(data);});
        
    })
});
server.listen(3000);