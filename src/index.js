const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "tmp_uploads/" });
const fs = require("fs");
const session = require("express-session");
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');


const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "dfasf",
    cookie: {
        maxAge: 1200000
    }
}));

app.use(cors());

app.use((req, res, next)=>{
    res.locals.pageName ="";
    req.query.from_middleware = 'hello';

    res.locals.isAdmin= false;
    if(req.session.admin && req.session.admin.account)
    {
        res.locals.admin = req.session.admin;
        res.locals.isAdmin= true;
    }
    next();
});

const db = require("./__connect_db");

app.get("/", (request, response) => {
    //response.send("adfef");
    response.render("home", { name: "首頁" })
});
app.get("/sales-json", (request, response) => {
    //response.send("adfef");
    const data = require("../data/sales.json");
    //response.send(data[1].name);
    response.render("sales", { sales: data });
});
app.get("/abc", (request, response) => {
    response.send("1234568");
});
app.get("/abc/efg", (request, response) => {
    response.send("123dfw8");
});
app.get("/try-qs", (request, response) => {
    response.json(request.query);
});
//const urlencodedParser=express.urlencoded({extended:false});
app.get("/try-post-form", (request, response) => {
    response.render("try-post-form");
});

app.post("/try-post-form", (request, response) => {
    response.render("try-post-form", request.body);
});

app.post("/try-post-json", (req, res) => {
    res.json(req.body);
});

app.post("/try-plus", (request, response) => {
    let a = request.body.a ? parseInt(request.body.a) : 0;
    let b = request.body.b ? parseInt(request.body.b) : 0;
    response.send((a + b).toString());
});

app.post("/try-plus2", (request, response) => {

    const output = {
        postData: request.body
    }
    let a = request.body.a ? parseInt(request.body.a) : 0;
    let b = request.body.b ? parseInt(request.body.b) : 0;

    output.result = (a + b)
    response.json(output);
});

app.post("/try-try", upload.single("avatar"), (req, res) => {
    res.json(req.file);
});

app.post("/try-upload", upload.single("avatar"), (req, res) => {
    let ext = "";

    switch (req.file.mimetype) {
        case 'image/png':
            ext = ".png";
            break;
        case 'image/jpeg':
            ext = ".jpg";
            break;
    }
    let filename = (new Date().getTime()) + ext;
    if (ext) {
        fs.rename(req.file.path, "./public/img/" + filename, error => {
            res.json({
                success: true,
                img: "/img/" + filename
            });

        })

    }
    else {
        fs.unlink(req.file.path, error => {
            res.json({
                success: false,
                img: "bad"
            });

        })

    }
});
app.get("/my-params1/*/*?", (req, res) => {

    res.json(req.params);
})

app.get(/^\/mobile\/09\d{2}-?\d{3}-?\d{3}$/, (req, res) => {
    let u = req.url.split("?")[0];
    u = u.split("-").join("");
    let mobile = u.slice(8);

    res.json({
        "url": u,
        "mobile": mobile
    });
});

const adminRouter = require(__dirname + "/admins/admin.js");
app.use(adminRouter);

app.get("/try-session",(req,res)=>{
    req.session.my_var= req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var:req.session.my_var,
        seesion:req.session
    });

});
app.get("/try-db",(req,res)=>{
    var sql="SELECT * FROM address_book LIMIT 0,5";
    db.query(sql,(error,results,fields)=>{
       // console.log(fields);

        res.json(results);

    });

});
app.get("/just-pending",(req,res)=>{



});
app.get("/try-axios",(req,res)=>{
    axios.get("https://www.gamer.com.tw/")
    .then(response=>{
        let $ = cheerio.load(response.data);
        let str="";

        $("img").each(function(i,el){
            let src =$(this).attr("src");
            str+=`<img src="${src}"><br>`;
        });
        res.send(str);
    });
});

app.use("/address-book" , require("./address_book"));

app.use(express.static("public"));

app.use((req, resp) => {
    resp.type("text/plain");
    resp.status(404);
    resp.send("幹你娘");

});

app.listen(3000, () => {

    console.log("sever started");
});