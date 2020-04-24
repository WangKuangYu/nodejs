const express = require("express");
const db = require("./__connect_db");
const moment = require("moment-timezone");

const router = express.Router();


router.use((req, res, next) => {
    res.locals.title = '通訊錄';

    const whiteList=["login","list","fake"];
    const u = req.url.split("/")[1];  // ["" , "list"] 

    if(whiteList.indexOf(u)<0){
       
       if(res.locals.admin){ 
           return next();
        }
    
    else{
        return res.redirect("/address-book/list");
    }
}
    next();
});


router.get("/add", (req, res) => {
    res.locals.title = "add"
    res.locals.pageName = "ad-add"

    res.render("address-book/add")
});

router.post("/add", (req, res) => {

    const output = {
        success: false,
        postData: req.body,
    };

    const sql = "INSERT INTO `address_book`( `name`, `email`, `address`, `mobile`, `birthday`, `created_time`)" +
        "VALUES (?,?,?,?,?,now())";

    db.query(sql, [

        req.body.name,
        req.body.email,
        req.body.address,
        req.body.mobile,
        req.body.birthday,
    ], (error, results) => {
        if (error) {
            console.log(error);
            output.error = error;
        } else {
            output.success = true;
            output.results = results;
        }
        res.json(output);


    });
});

router.get('/del/:sid', (req, res) => {

    const del_sql = "DELETE FROM `address_book` WHERE `s_id` = ?"

    db.query(del_sql, [req.params.sid], (error, results) => {
        console.log(results);

        res.redirect(req.header("Referer"));


    });


});

router.get('/edit/:sid', (req, res) => {

    res.locals.title = "edit"


    const sql = "SELECT * FROM `address_book` WHERE `s_id`=?";
    db.query(sql, [req.params.sid], (error, results) => {


        if (results && results.length === 1) {


            results[0].birthday = moment(results[0].birthday).format("YYYY-MM-DD");
            res.render("address-book/edit", { row: results[0] });


        }
        else {
            return res.redirect('/address-book/list');
        }
    })
});


router.post('/edit/:sid', (req, res) => {


    const output = {
        success: false,
        info: "",
        postData: req.body,
    };


    const s_sql = "SELECT * FROM `address_book` WHERE `email`=? AND `s_id`<>?";
    db.queryAsync(s_sql, [req.body.email, req.params.sid])
        .then(results => {

            if (results.length) {

                output.info = "email already existed";
                res.json(output);
            }
            else {
                const sql = "UPDATE `address_book` SET ? WHERE `s_id`=?";
                return db.queryAsync(sql, [req.body, req.params.sid])

            }

        })

        .then(results => {

            if (results.changedRows === 1) {
                output.info = "edit sucecss";
                output.success = true;
            }
            else {
                output.info = "no changed";
            }
            res.json(output)

        })
        .catch((error)=>{
  
                output.info = 'edit error';
                output.error = error;
                res.json(output);


        })

});

// router.post('/edit/:sid', (req, res) => {


//     const output = {
//         success: false,
//         info: "",
//         postData: req.body,
//     };


//     const s_sql = "SELECT * FROM `address_book` WHERE `email`=? AND `s_id`<>?";
//     db.query(s_sql, [req.body.email, req.params.sid], (error, results) => {

//         if (results.length) {

//             output.info = "email already existed";
//             res.json(output);
//         }
//         else {


//             const sql = "UPDATE `address_book` SET ? WHERE `s_id`=?";
//             db.query(sql, [req.body, req.params.sid], (error, results) => {

//                 if (error) {

//                     output.info = 'edit error';
//                     output.error = error;
//                     res.json(output);
//                 }
//                 else {
//                     if (results.changedRows === 1) {
//                         output.info = "edit sucecss";
//                         output.success = true;
//                     }
//                     else {
//                         output.info = "no changed";
//                     }
//                     res.json(output)
//                 }
//             })
//         }

//     })

// });


router.get("/login",(req,res)=>{
    res.render("address-book/login");
});

router.post("/login",(req,res)=>{

    const sql = "SELECT `s_id`, `account`, `nickname` FROM `admin` WHERE `account`=? AND `password`=SHA1(?)";
    db.queryAsync(sql, [req.body.account, req.body.password])
        .then(results=>{
            if(results && results.length===1){
                req.session.admin = results[0];
                res.json({
                    success: true,
                    admin: results[0]
                });
            } else {
                res.json({success: false});
            }
        })
        .catch(error=>{
            res.json({
                success: false,
                error: error
            });
        })
    
});
router.get("/logout",(req,res)=>{
    
    delete req.session.admin;
    res.redirect('/address-book/login');
});

router.get('/fake', (req, res) => {

    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_time`) VALUES " +
        "(?, ?, ?, ?, ?, NOW())";

    for (let i = 0; i < 5; i++) {

        let first = ["趙", "錢", "孫", "李", "周", "吳", "鄭", "王", "馮", "陳", "褚", "衛", "蔣", "沈", "韓", "楊"];
        let name = first[Math.floor(Math.random() * 16)] + first[Math.floor(Math.random() * 16)] + first[Math.floor(Math.random() * 16)];
        let email = new Date().getTime().toString(16) + Math.floor(Math.random() * 1000) + '@gmail.com';
        let phone = "09" + Math.floor(Math.random() * 10000000);
        let birth = "19" + Math.floor(Math.random() * 100).toString() + "-" + Math.floor(Math.random() * 12) + "-" + Math.floor(Math.random() * 28);
        let city = ["台北市", "台中市", "新北市", "高雄市", "桃園市", "洛杉磯", "紐約", "巴黎", "柏林", "華沙", "阿姆斯特丹"];
        let address = city[Math.floor(Math.random() * 10)]

        db.query(sql, [
            name,
            email,
            phone,
            birth,
            address,
        ]);
    }

    res.redirect("/address-book/list");

});



router.get("/list/:page?", (req, res) => {

    res.locals.title = "list"
    res.locals.pageName = "ad-list"

    var perPage = 5;

    var totalRows = 0;

    var totalPage = 0;

    let page = req.params.page ? parseInt(req.params.page) : 1;

    let t_sql = `SELECT COUNT(*) AS num FROM address_book `

    db.query(t_sql, (error, results) => {

        totalRows = results[0].num;
        totalPage = Math.ceil(totalRows / perPage);

        if (page < 1) {

            res.redirect("/address-book/list/1");
            return;
        }

        if (page > totalPage) {
            res.redirect("/address-book/list/" + totalPage);
            return;
        }

        var sql = `SELECT * FROM address_book LIMIT ${(page - 1) * perPage} , ${perPage}`;


        db.query(sql, (error, results, fields) => {
            //console.log(fields);

            const fm = "YYYY-MM-DD";
            results.forEach((element) => {

                element.birthday = moment(element.birthday).format(fm);

            });


            const output={
                prePage: perPage,
                page: page,
                totalRows: totalRows,
                totalPage: totalPage,
                row: results
            }
            if(res.locals.isAdmin){
                res.render("address-book/list-admin", output);

            }
            else{
                res.render("address-book/list", output);
            }

   
        });


    });

    // var sql = `SELECT * FROM address_book LIMIT ${(page - 1) * prePage} , ${prePage}`;


    // db.query(sql, (error, results, fields) => {
    //     console.log(fields);

    //     res.json({
    //         prePage: prePage,
    //         page: page,
    //         row: results

    //     });

    // });

});





module.exports = router;