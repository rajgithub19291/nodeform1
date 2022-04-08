const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const indexrouter = express.Router();
const loginmodal = require('../modal/user');
const login_var = {};
login_var['msg'] = "";

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

indexrouter.get('/',(req,res)=>{
    login_var['title'] = "Login User";
    login_var['msg'] = ""; 
    res.render('index',login_var);
});

indexrouter.post('/',(req,res)=>{
    var usr = req.body.uname;
    var pass = req.body.password;
    var checkUser=loginmodal.findOne({username:usr});
    checkUser.exec((err,data)=>{
        if(err) throw err;
        if(data == null){
            login_var['msg'] = [{'msg':'Invalid Username and Password.'}];
            res.render('index',login_var);
        } else {
            var userid = data._id;
            var username = data.username;
            var email = data.email;
            var getpass = data.password;
            if(bcrypt.compareSync(pass,getpass))
            {
                var token = jwt.sign({ userID : userid },'loginToken');
                localStorage.setItem('userToken',token);
                localStorage.setItem('loginUser',username);
                res.redirect('/dashboard');
            } else {
                login_var['msg'] = [{'msg':'Invalid Username and Password.'}];
                res.render('index',login_var);
            }
        }
    });
    
});

indexrouter.get('/signup',(req,res)=>{
    login_var['title'] = "New User Register";
    res.render('signup',login_var);
    login_var['msg'] = "";
});


indexrouter.post('/signup',checkUsername,checkUseremail,check_signup_validator(),async (req,res)=>{
    
    try
    {
        const errors = validationResult(req);
        login_var['title'] = "New User Register";
        if (!errors.isEmpty()) 
        {
            res.status(400);
            login_var['msg'] = await errors.array();
            res.redirect('/signup');
            return;
        }
        
        var hashpass = await createuserhash(req.body.password);
        const newuser = new loginmodal({
            username : req.body.uname,
            email : req.body.email,
            password : hashpass
        });
        const usersave = await newuser.save();
        login_var['msg']='';
        res.render('signup',login_var);
        
    }catch(err){
        res.send(err);
    }
   
});

function check_signup_validator()
{

    return[check('uname','Username InValid').isLength({ min: 6 }),
    check('email','Email InValid',).isEmail().normalizeEmail(),
    check('password','Password InValid').isLength({ min: 6 }),
    check('confpassword','Confirm Password InValid').isLength({ min: 6 })
    ];
}

function checkUsername(req,res,next){
    var uname=req.body.uname;
    var checkexitusername=loginmodal.findOne({username:uname});
    checkexitusername.exec((err,data)=>{
   if(err) throw err;
   if(data)
   {
    login_var['title'] = "New User Register";
    login_var['msg'] = [{'msg':'Username already exist'}];
    login_var['custommsg'] = 'error';    
    return res.render('signup', login_var);
   }
   next();
    });
  }

  function checkUseremail(req,res,next){
    var email=req.body.email;
    var checkexitemail=loginmodal.findOne({email:email});
    checkexitemail.exec((err,data)=>{
   if(err) throw err;
   if(data)
   {
    login_var['title'] = "New User Register";
    login_var['msg'] = [{'msg':'Email already exist'}]; 
    login_var['custommsg'] = 'error';   
    return res.render('signup', login_var);
   }
   next();
    });
  }
  
  const createuserhash = async (pass) => {
       const salt = await bcrypt.genSalt(10);
       const hash = await bcrypt.hash(pass,salt);
       return hash;
  }

function checkLoginUser(req,res,next)
{
    var userToken = localStorage.getItem('userToken');
    try
    {
        var decoded = jwt.verify(userToken, 'loginToken');
    }
    catch(err)
    {
        res.redirect('/');
    }
    next();
}
indexrouter.get('/dashboard',checkLoginUser,(req,res)=>{
    login_var['title'] = "Dashboard";
    res.render('dashboard',login_var);
    login_var['msg'] = "";
}); 

indexrouter.get('/logout', (req, res, next)=>{
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect('/');
  });

module.exports = indexrouter;