//引入express框架 安装：npm install express --save
var express = require('express');
//使用express
var app = new express;
//引入路由模块
var router = require('./routes/router');
//引入ejs模板 安装：npm install ejs --save
var ejs = require('ejs');
//使用ejs，默认目录为views
app.set('view engine','ejs');
//使用静态文件
app.use(express.static('public'));
//使用虚拟目录存放静态文件
app.use('/upload',express.static('upload'));
//引入session用于服务器存储数据  安装：npm install express-session --save
var session = require('express-session');  
//配置session
app.use(session({
  secret: 'star', //加密串
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge:1000*60*30 },
  rolling:true
}))
//路由配置
app.use('/',router);
//监听端口
app.listen('3001','127.0.0.1');