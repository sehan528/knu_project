const express = require('express');
const app = express();
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
const MongoClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //



var db;
MongoClient.connect("mongodb+srv://admin:1q2w3e4r@cluster0.dh8gyjd.mongodb.net/test", function(에러,client) {
    // 에러 = 에러가 발생했을 시 해당 URL을 출력 해줄 것.
    if(에러) {return console.log(에러)};
    db = client.db('KNUDB');

    app.listen(3000, function() {
        console.log('listening on 3000');
    });
    
})


app.get('/', (req,res) => {
    res.render('index.ejs', {welcomeid : "TEST"});
});


app.get('/used_book', (req,res) => {
    // DB에 저장된 post -> collection 안에 포함된 (조건) 데이터를 꺼내주세요.
    db.collection('DB_bookUpload').find().toArray(function(err, result) {
        // console.log(result);

        res.render('used_book.ejs' , { posts : result });  // 찾은걸 ejs file에 넣어주세요.
    }); // 모든 데이터 탐색.

});

    // res.render('used_book.ejs');



// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //

app.use('/book_search', require('./routes/server_book_search.js'));

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : 'hidden', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());



app.get('/login_sign' , (req, res) => {
    res.render('login_sign.ejs');
}); 

// passport.authenticate : 응답해주기 전 local방식으로 ID,PW 인증. / 인증 실패시 /fail로 이동
app.post('/login_sign' , passport.authenticate('local' , {
    failureRedirect : 

    '/login_sign'     
}), function(req, res) {
    // 로그인 성공
    // console.log(res);
    console.log(req.user.db_id);
    // var enterID = req.user.db_id;

    // res.write("<script>alert(enterID + 'LOGIN!')</script>");
    // res.write("<script>window.location=\" / \"</script>");
    res.render('index.ejs', {welcomeid : req.user.db_id});
    //res.redirect('/')
}); 

app.get('/user_page' , logincheck, function(req, res) {
    
    db.collection('DB_bookUpload').find().toArray(function(err, result) {
        // console.log(result);
        // console.log(req.user);
        res.render('user_page.ejs' , { posts : result, 사용자 : req.user });  // 찾은걸 ejs file에 넣어주세요.
    }); // 모든 데이터 탐색.
})

app.get('/user_messenger' , logincheck, function(req, res) {
    
    db.collection('DB_bookUpload').find().toArray(function(err, result) {
        // console.log(result);
        // console.log(req.user);
        res.render('user_messenger.ejs' , { posts : result, 사용자 : req.user });  // 찾은걸 ejs file에 넣어주세요.
    }); // 모든 데이터 탐색.
})


function logincheck (req, res, next) {
    if(req.user) {
        // console.log(요청.user);
        next()
    }
    else {
        // res.send('로그인 하지 않음!'); // 추후 redirect.
        // console.log(req.referer);
        res.write("<script>alert('go to login page.')</script>");
        res.write("<script>window.location=\" /login_sign \"</script>");
        // res.render('login_sign.ejs');
    }
}

// LocalStrategy( {설정}, fuction(){ 아이디 검사하는 코드} )
passport.use(new LocalStrategy({
    usernameField: 'login_id',          // form 에다 입력된 tag 인식. = 어떤 <input> 인지 <input>의 name attr값을 탐지함.
    passwordField: 'login_password',    // to login.ejs
    session: true,                      // 세션 생성해줌
    passReqToCallback: false,           // ID,PW 외 다른 인증수단 요청? -> function argument에서 req 가능. 자세한건 document.

    // done (서버에러 , 성공시 사용자 DB데이터, 에러메세지)    
    }, function (get_id, get_pw, done) {
    // console.log(get_id, get_password);
    db.collection('DB_user').findOne({ db_id: get_id }, function (err, res) {
        if (err) return done(err)

        if (!res) return done(null, false, { message: '존재하지않는 아이디 입니다.'})
        if (get_pw == res.db_pw) {
            console.log(res);
            return done(null, res)
        } else {
            return done(null, false, { message: '틀린 비밀번호 입니다.' } )
        }
    })
}));

// user.id를 바탕으로 세션데이터 생성 -> 쿠키로 생성 -> 브라우저 전송.
passport.serializeUser(function(user, done){
    // must DB check
    done(null, user.db_id);
    // console.log(user.id);
});

// 로그인한 유저의 세션아이디를 바탕으로 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(get_id, done){
    db.collection('DB_user').findOne({ db_id : get_id}, function(err,res){
        done(null, res);
        // console.log(res);
    })
});

// DB Tag <- HTML Value
app.post('/register', function(req, res) {

    db.collection('DB_user').insertOne( { db_id : req.body.regi_id, db_pw : req.body.regi_pw, db_name : req.body.regi_name, admin : false }, function(err, res) {
        
    });
    res.redirect('/')
});

// 책등록 & 미들웨어 때문에 하단으로 옮겼습니다.
app.get('/used_write', logincheck, (req,res) => {
    res.render('used_write.ejs');
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //


let multer = require('multer');
var path = require('path');

// diskStorage , memoryStorage

var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, './public/image')
    },

    filename : function(req, file, cb){
        cb(null, file.originalname )
    }
});


// var upload = multer({storage : storage});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 512 * 512
    }
});

// app.get('/used_write', function(요청,응답) {
//     응답.render('used_book.ejs')
// });

app.post('/used_write', upload.single('img'), function(req,res) {
    
    db.collection('DB_postCount').findOne({name : 'DB_PSCNT'}, function(err,res1) {
        var GET_PSCNT = res1.totalPost;

        var post = {
            db_upload_post : GET_PSCNT + 1,
            db_uploader : req.user.db_id,
            db_upload_Name : req.body.book_name, 
            db_upload_Author : req.body.book_author, 
            db_upload_Price : req.body.book_price, 
            db_upload_isCutoff : req.body.isCutoff,
            db_upload_isDiscolor : req.body.isDiscolor,
            db_upload_isDoodle : req.body.isDoodle,
            db_upload_isBookbinding : req.body.isBookbinding,
            db_upload_img : req.file.filename,
            db_upload_Comment : req.body.comment
        }

        db.collection('DB_bookUpload').insertOne(post,function(err, res) {
            console.log('데이터 등록!');
            db.collection('DB_postCount').updateOne({name : 'DB_PSCNT'}, {$inc : {totalPost : 1}},function(err, 결과){
                if(err) return console.log(err);
            })
        });
    });
    console.log(res);
    res.redirect('/used_book')
});

app.get('/used_view/:Viewid', (req,res) => {
    db.collection('DB_bookUpload').findOne({db_upload_post : parseInt(req.params.Viewid)}, function(err, result) {
        // console.log(result);
        res.render('used_view.ejs', {getData : result});
    })
});


app.get('/edit/:Viewid',function(req, res) {
    db.collection('DB_bookUpload').findOne({db_upload_post : parseInt(req.params.Viewid)}, function(err, result) {
        console.log(result);
        res.render('edit.ejs', {getData : result});
    })
});


app.put('/edit' , upload.single('img'), function(req, res) {
    console.log(req);
    var post = {
        db_upload_Name : req.body.book_name, 
        db_upload_Author : req.body.book_author, 
        db_upload_Price : req.body.book_price, 
        db_upload_isCutoff : req.body.isCutoff,
        db_upload_isDiscolor : req.body.isDiscolor,
        db_upload_isDoodle : req.body.isDoodle,
        db_upload_isBookbinding : req.body.isBookbinding,
        // db_upload_img : req.file.filename,
        db_upload_Comment : req.body.comment
    }

    db.collection('DB_bookUpload').updateOne( {db_upload_post: parseInt(req.params.Viewid)}, {$set: post}, 
    function(){
        console.log(post);
        console.log('수정완료');
        res.redirect('/user_page');
        
    });
    
});







