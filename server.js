const express = require('express');
const app = express();
app.set('view engine', 'ejs');
// /public 경로에 있는 파일들을 static 파일로 제공
app.use('/public', express.static('public'));

const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

require('dotenv').config()

const axios = require('axios');


// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //


var db;
MongoClient.connect(
    process.env.DB_URL, 
    function(에러,client) {
    // 에러 = 에러가 발생했을 시 해당 URL을 출력 해줄 것.
    if(에러) {return console.log(에러)};
    db = client.db('KNUDB');

    app.listen(process.env.PORT, function() {
        console.log('listening on 3000');
    });
    
})


app.get('/', (req,res) => {
    res.render('index.ejs', {welcomeid : "TEST"});
});

// why? 왜 앱으로 실행할 시 public/view 로 요청하는지 파악해두시오.
app.get('/public/views/index.ejs', (req,res) => {
    console.log("App type 으로 실행했음");
    // res.render('index.ejs', {welcomeid : "TEST"});
    res.redirect('/');
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //


// offline.html 파일을 로드
app.get('/offline.html', (req, res) => {
    res.sendFile('/offline.html', { root: __dirname });
});

app.get('/splash.html', (req, res) => {
    res.sendFile('/splash.html', { root: __dirname });
});

// 서비스 워커 등록 요청이 들어올 때 Service-Worker-Allowed 헤더 설정
app.get('/sw.js', (req, res) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(__dirname + '/sw.js');
});

// manifest
app.get('/manifest.json', (req, res) => {
    res.sendFile(__dirname + '/manifest.json');
});

// image
app.get('/project_icon.png', (req, res) => {
    res.sendFile(__dirname + '/public/image/project_icon.png');
});

app.get('/splash.png', (req, res) => {
    res.sendFile(__dirname + '/public/image/splash.png');
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //



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

// 라우팅

app.use('/book_search', require('./routes/server_book_search.js'));

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //

// 세션 토큰 로그인 방법

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const session = require('express-session');

app.use(session({secret : 'hidden', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login_sign' , (req, res) => {
    // const kakaoCode = req.query.code;
    // console.log(kakaoCode);

    // if (kakaoCode) {
    //     axios.post('https://kauth.kakao.com/oauth/token', {
    //         grant_type : 'authorization_code',
    //         client_id : process.env.KAKAO_JS_KEY,
    //         redirect_uri : process.env.REDIRECT_URL,
    //         code : kakaoCode
    //     }, {
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    //         }
    //     })
    //     .then(function (response) {
    //         // Kakao.Auth.setAccessToken(response.data.access_token);
    //         console.log(JSON.stringify(response.data));
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //     });
    // }
    res.render('login_sign.ejs');
}); 


// , passport.authenticate('kakao')
app.get('/login_sign/kakao', passport.authenticate('kakao', {
    failureRedirect:
        '/login_sign'
}), function (req, res) {
    // console.log(res);
    console.log("kakao login test");
    console.log(req.user);
    res.render('index.ejs', { welcomeid: req.user.db_id });
}); 


// passport.authenticate : 응답해주기 전 local방식으로 ID,PW 인증. / 인증 실패시 /fail로 이동
app.post('/login_sign', passport.authenticate('local', {
    failureRedirect:
        '/login_sign'
}), function (req, res, err) {
    if(err) {
        // console.log("패스포트 에러");
        console.log(err);
    }
    // 로그인 성공
    // console.log(res);
    console.log("check user information in post.login_sign");
    console.log(req.user);
    // var enterID = req.user.db_id;

    // res.write("<script>alert(enterID + 'LOGIN!')</script>");
    // res.write("<script>window.location=\" / \"</script>");
    res.render('index.ejs', { welcomeid: req.user.db_id });
    //res.redirect('/')
}); 


app.get('/user_page' , logincheck, function(req, res) {
    // console.log(req.user.db_id);
    db.collection('DB_bookUpload').find({db_uploader: req.user.db_id}).toArray(function(err, result) {
        // console.log(result);
        // console.log(req.user);
        res.render('user_page.ejs' , { posts : result, 사용자 : req.user });  // 찾은걸 ejs file에 넣어주세요.
    }); // 모든 데이터 탐색.
})

app.get('/user_messenger' , logincheck, function(req, res) {
    // console.log(req.user._id);
    db.collection('DB_chatList').find({member: ObjectId(req.user._id)}).toArray(function(err, result) {
        // console.log(result);
        // console.log(req.user);
        res.render('user_messenger.ejs' , { posts : result, 사용자 : req.user });  // 찾은걸 ejs file에 넣어주세요.
    }); // 모든 데이터 탐색.
})

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //

// 미들웨어 -> 이후 생성된 토큰 검사만 함.
function logincheck (req, res, next) {
    // console.log("미들웨어 체크");
    // console.log(req);
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
    console.log(get_id, get_pw);
    db.collection('DB_user').findOne({ db_id: get_id }, function (err, res) {
        if (err) return done(err)

        if (!res) return done(null, false, { message: '존재하지않는 아이디 입니다.'})
        if (get_pw == res.db_pw) {
            console.log(`로그인 성공 & 결과를 반환 in passport.use()`);
            console.log(res);
            return done(null, res)
        } else {
            return done(null, false, { message: '틀린 비밀번호 입니다.' } )
        }
    })
}));

// //KakaoStrategy
passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_REST_API_KEY,
    callbackURL: '/login_sign/kakao',  
    },
    async(accessToken, refreshToken, profile, done) => {
        var get_id = profile._json.kakao_account.email
        var get_pw = profile._json.id
        var get_nickname = profile._json.properties.nickname
        // console.log(accessToken, profile);
        try {
            let exUser = null;
            const user = await new Promise((resolve, reject) => {
                db.collection('DB_user').findOne({ db_id: get_id }, function (err, res) {
                    if (err)  reject(err)
                    if (res === null) {
                        resolve(false)
                    } else if (res.db_pw && get_pw === res.db_pw) {
                        console.log(`kakao pass to passport.use()`);
                        exUser = res;
                        resolve(res)
                    } else {
                        resolve(false)
                    }
                })
            })
        
            if (exUser) {
                done(null, exUser);
            } 
            // 없는 정보. 회원 신규 생성.
            else {
                const regi = await new Promise((resolve, reject) => {
                    db.collection('DB_user').insertOne({ db_id: get_id, db_pw : get_pw, db_name : get_nickname, admin : false }, function (err, res) {
                        if (err)  reject(err)
                        if (res) {
                            console.log(`kakao 회원가입`);

                            db.collection('DB_user').findOne({ db_id: get_id }, function (err, res) {
                                if (err)  reject(err)
                                if (res === null) {
                                    resolve(false)
                                } else if (res.db_pw && get_pw === res.db_pw) {
                                    console.log(`가입 후 로그인 시도`);
                                    newUser = res;
                                    resolve(res)
                                } else {
                                    resolve(false)
                                }
                            })
                            // resolve(res)
                        } else {
                            resolve(false)
                        }
                    })
                })
                done(null, newUser);
            }
        } catch(error) {
            console.error(error);
            done(error);
        }
    } 
));

// user.id를 바탕으로 세션데이터 생성 -> 쿠키로 생성 -> 브라우저 전송.
passport.serializeUser(function(user, done){
    // must DB check
    console.log("in passport.serializeUser");
    console.log(user);

    done(null, user.db_id);
    // console.log(user.id);
});

// 로그인한 유저의 세션아이디를 바탕으로 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(get_id, done){
    console.log("in passport.deserializaUser")
    console.log(get_id);
    db.collection('DB_user').findOne({ db_id : get_id}, function(err,res){
        done(null, res);
        // console.log(res);
    })
});


// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //


// DB Tag <- HTML Value
app.post('/register', function(req, res) {
    console.log(req.body);
    db.collection('DB_user').findOne({ db_id: req.body.regi_id }, function (err, result) {
        if(err) throw err;

        if(result) {
            // res.send('이미 등록된 ID!');
            // res.json({success: false, message: '이미 등록된 ID!'})
            res.write("<script>alert('ID is already registered. Please check again.')</script>");
            res.write("<script>window.location=\" /login_sign \"</script>");
        }

        else {
            db.collection('DB_user').insertOne( { db_id : req.body.regi_id, db_pw : req.body.regi_pw, db_name : req.body.regi_name, admin : false }, function(err, res) {
                if(err) throw err;

                console.log('회원가입!');
            });
            res.redirect('/');
        }

    });

});

// 책등록 & 미들웨어 때문에 하단으로 옮겼습니다.
app.get('/used_write', logincheck, (req,res) => {
    res.render('used_write.ejs');
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //

//  multer (이미지 편집 및 등록을 위한 미들웨어)

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


// dummy
// app.get('/used_write', function(요청,응답) {
//     응답.render('used_book.ejs')
// });

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //

/** 새 글 작성  */
app.post('/used_write', logincheck, upload.single('img'), function(req,res) {
    
    db.collection('DB_postCount').findOne({name : 'DB_PSCNT'}, function(err,res1) {
        var GET_PSCNT = res1.totalPost;

        var post = {
            db_upload_post : GET_PSCNT + 1,
            db_uploader : req.user.db_id,
            db_uploader_ID : req.user._id,
            db_upload_Name : req.body.book_name, 
            db_upload_Author : req.body.book_author, 
            db_upload_Price : req.body.book_price, 
            db_upload_isCutoff : req.body.isCutoff,
            db_upload_isDiscolor : req.body.isDiscolor,
            db_upload_isDoodle : req.body.isDoodle,
            db_upload_isBookbinding : req.body.isBookbinding,
            db_upload_img : req.file.filename,
            db_upload_Comment : req.body.comment,
            db_is_Sell : null
        }

        db.collection('DB_bookUpload').insertOne(post,function(err, res) {
            console.log('데이터 등록!');
            db.collection('DB_postCount').updateOne({name : 'DB_PSCNT'}, {$inc : {totalPost : 1}},function(err, 결과){
                if(err) return console.log(err);
            })
        });
    });
    // console.log(res);
    res.redirect('/used_book')
});

/** 게시물 상세보기  */
app.get('/used_view/:Viewid', (req,res) => {
    db.collection('DB_bookUpload').findOne({db_upload_post : parseInt(req.params.Viewid)}, function(err, result) {
        // console.log(result);
        res.render('used_view.ejs', {getData : result});
    })
});

// ------------------------------------------------------------------------------------------------------------------

/** 정보 수정을 위한 데이터  DB -> 클라  */
app.get('/edit/:Viewid',logincheck, function(req, res) {
    db.collection('DB_bookUpload').findOne({db_upload_post : parseInt(req.params.Viewid)}, function(err, result) {
        // console.log(result);
        res.render('edit.ejs', {getData : result});
    })
});

/** 정보 수정 클라 -> DB  */
app.put('/edit' , upload.single('img'), function(req, res) {
    var number =  req.body.post_number;

    // console.log(req.file.filename); // 클라이언트에서 전송한 데이터
    // console.log(req.body.img_holder);


    var post = {
        db_upload_post : req.body.post_number,
        db_upload_Name : req.body.book_name, 
        db_upload_Author : req.body.book_author, 
        db_upload_Price : req.body.book_price, 
        
        db_upload_isCutoff : req.body.isCutoff,
        db_upload_isDiscolor : req.body.isDiscolor,
        db_upload_isDoodle : req.body.isDoodle,
        db_upload_isBookbinding : req.body.isBookbinding,
        db_upload_img : req.body.img_holder,      // 우선 히든을 받아온다.

        db_upload_Comment : req.body.comment
    }

    if (post.db_upload_isCutoff === undefined) {
        post.db_upload_isCutoff = null;
    }
    
    if (post.db_upload_isDiscolor === undefined) {
        post.db_upload_isDiscolor = null;
    }
    
    if (post.db_upload_isDoodle === undefined) {
        post.db_upload_isDoodle = null;
    }
    
    if (post.db_upload_isBookbinding === undefined) {
        post.db_upload_isBookbinding = null;
    }

    if (req.file?.filename) {
        if (post.db_upload_img !== req.file.filename) {
            post.db_upload_img = req.file.filename;
        }
        else {
            console.log("skip");
        }
    }


    console.log(post);
    // console.log(post.db_upload_Name);
    // console.log(db_post_number); // 이게 문제
    // console.log((number));


    // DB 전송
    db.collection('DB_bookUpload').updateOne( {db_upload_post: parseInt(number)}, 
    {$set: {
        db_upload_Name: post.db_upload_Name,
        db_upload_Author: post.db_upload_Author,
        db_upload_Price: post.db_upload_Price,
        db_upload_isCutoff: post.db_upload_isCutoff,
        db_upload_isDiscolor: post.db_upload_isDiscolor,
        db_upload_isDoodle: post.db_upload_isDoodle,
        db_upload_isBookbinding: post.db_upload_isBookbinding,
        db_upload_img: post.db_upload_img,
        db_upload_Comment: post.db_upload_Comment
    }}, 
    function(err,result){
        
        if(err) return console.log(err);

        console.log('수정완료');
        res.redirect('/user_page');
        
    });
    
});

app.delete('/delete', logincheck, function(req, res) {
    req.body._id = parseInt(req.body._id);
    var postId = {db_upload_post : req.body._id};
    console.log(postId);

    db.collection('DB_bookUpload').deleteOne(postId, function(err, result) {
        if (err) throw err;
        console.log('삭제 완료');
        res.status(200).send({message : '삭제에 성공 했습니다.'});
        
        db.collection('DB_postCount').updateOne({name : 'DB_PSCNT'}, {$inc : {totalPost : -1}}, function(err, res) {
            if(err) return console.log(err);
        });
    });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------------------- //

/** 메신져  */

const { ObjectId } = require('mongodb');
// mongodb의 objectId 자료형으로 담을 수 있게끔 지원된 기능을 가져옵니다 = mongodb로 부터... (몽고디비에 의해 만들어진 기능.)

app.post('/chatList', logincheck, function(req, res) {


    var CHATINFO = {
        chat_Title : (req.body.bookName),
        member : [ObjectId(req.body.Receiver), req.user._id],
        uploder: req.body.Uploder,
        // 받은 사람 , 건 사람
        date : new Date()
    }

    db.collection('DB_chatList').findOne({
        chat_Title: req.body.bookName,
        member: [ObjectId(req.body.Receiver), req.user._id],
    }, function(err, result) {
        if (err) throw err;
        

        // if(CHATINFO.member[0] == CHATINFO.member[1]) {
        //     console.log(CHATINFO.member[0]);
        //     console.log(CHATINFO.member[1]);

        //     res.send('잘못된 요청 입니다.');
        // }

        if (result || CHATINFO.member[0].toString() === CHATINFO.member[1].toString()) {
            // 이미 해당 채팅방이 존재하는 경우
            res.send('잘못된 접근입니다. 다시 확인해주세요.');
        } else {
            // 해당 채팅방이 존재하지 않는 경우
            db.collection('DB_chatList').insertOne(CHATINFO).then((result)=>{
                res.send('DB_chatList 신규 등록. 대화방이 생성되었음.');
            });
        }
    });
    
    // console.log(CHATINFO);

    // db.collection('DB_chatList').insertOne(CHATINFO).then((result)=>{
    //     res.send('DB_chatList 신규 등록. 대화방이 생성되었음.');
    //     // res.render('/user_chat.ejs');
    // })
});



app.get('/user_chat', logincheck, function (req, res) {
    db.collection('DB_chatList').find({ member : req.user._id }).toArray().then((result) => {
        console.log(req.user._id);
        console.log(result);
        res.render('user_chat.ejs', { data: result , host : req.user._id})
    })
}); 


app.post('/message', logincheck, function (req, res) {
    // console.log(req);
    var generateChat = {
        parent: req.body.parent,
        userid: req.user._id,
        content: req.body.content,
        date: new Date(),
    }
    db.collection('DB_message').insertOne(generateChat)
        .then((result) => {
            res.send(result);
        })
}); 

app.get('/message/:CHATID', logincheck, function(req, res){

    res.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    });

    db.collection('DB_message').find({ parent : req.params.CHATID }).toArray()
    .then((result)=>{
        res.write('event: test\n');
        res.write('data:'+ JSON.stringify(result) + '\n\n');    
    })

    const pipeline = [
        { $match : {'fullDocument.parent' : req.params.CHATID} }
        // fullDocument. 사용자 입력 -> $match의 내용이 추가/수정/삭제 시 changeStream 작동.
    ];

    const collection = db.collection('DB_message');
    const changeStream = collection.watch(pipeline);
    changeStream.on('change', (result)=> {
        // result.fullDocument
        res.write('event: test\n');
        res.write('data:'+ JSON.stringify([result.fullDocument]) + '\n\n');    
        console.log(result.fullDocument);
    });

});