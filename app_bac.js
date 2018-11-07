//引入express框架 安装：npm install express --save
var express = require('express');
//使用express
var app = new express;
//引入ejs模板 安装：npm install ejs --save
var ejs = require('ejs');
//使用ejs，默认目录为views
app.set('view engine','ejs');
//使用静态文件
app.use(express.static('public'));
//使用虚拟目录存放静态文件
app.use('/upload',express.static('upload'));
//引入分装好的操作数据库方法
var DB = require('./modules/db.js');
//图片上传插件的使用 安装: npm install multiparty --save
var multiparty = require('multiparty');
//引入md5-node进行相关数据的加密  安装：npm install md5-node --save
var md5 = require('md5-node');
//引入body-parser接收post请求的数据 安装：npm install body-parser --save
var bodyParser = require('body-parser');
//中间件使用body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
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
//自定义中间件用于用户权限设置
app.use((req,res,next) => {
	//判断路由
	if(req.url == '/login' || req.url == '/dologin'){
		next();
	}else{
		//通过是否有session数据进行权限判断
		if(req.session.userinfo != undefined && req.session.userinfo != ''){
			//配置全局变量，可以在任何模板中使用
			app.locals['userinfo'] = req.session.userinfo;
			next();
		}else{
			res.redirect('/login');
		}
	}
})
//路由配置
app.get('/',(req,res) => {
	res.render('login')
})
app.get('/login',(req,res) => {
	res.render('login')
})
app.get('/loginOut',(req,res) => {
	//销毁session
	req.session.destroy((err) => {
		if(err){
			console.log(err)
		}else{
			res.redirect('/login')
		}
	})
})
app.post('/dologin',(req,res) => {
	var username = req.body.username;
	var password = md5(req.body.password);
	DB.find('user',{username,password},(error,data) => {
		if(error){
			console.log(error)
		}else{
			if(data.length>0){
				//将用户登录信息存储到session中
				req.session.userinfo = data[0].username;
				//页面重定向
				res.redirect('/product');
			}else{
				res.send("<script>alert('用户名或密码错误，登录失败');location.href='/login'</script>")
			}
		}
	})		
})
app.get('/product',(req,res) => {
	DB.find('product',{},(error,data) => {
		if(error){
			console.log(error);
		}else{
			//将从数据库获取到的数据渲染到模板中
			res.render('product',{data})
		}
	})
})
//渲染增加数据页面
app.get('/add',(req,res) => {
	res.render('add')
})
//增加数据
app.post('/doadd',(req,res) => {
	//获取上传的数据，既可以拿到图片也可以拿到数据  注意form里面需要加上enctype="multipart/form-data"
	var form = new multiparty.Form();
	//图片上传目录
	form.uploadDir = 'upload';
	form.parse(req,(error,fields,fiels) => {
		if(error){
			console.log(error);
			return false;
		}
		var name = fields.name[0];
		var price = fields.price[0];
		var fee = fields.fee[0];
		var pic = fiels.pic[0].path;
		DB.insert('product',{name,price,fee,pic},(error,data) => {
			if(error){
				cosole.log(error);
				return false;
			}
			res.redirect('/product');
		})
	})
})
//渲染编辑商品页面
app.get('/edit',(req,res) => {
	//获取get请求的数据
	var id = req.query.id;
	DB.find('product',{'_id':new DB.ObjectID(id)},(error,data) => {
		if(error){
			console.log(error)
			return false;
		}
		res.render('edit',{list:data[0]})
	})
})
//修改商品
app.post('/doedit',(req,res) => {
	//获取上传的数据，既可以拿到图片也可以拿到数据  注意form里面需要加上enctype="multipart/form-data"
	var form = new multiparty.Form();
	//图片上传目录
	form.uploadDir = 'upload';
	form.parse(req,(error,fields,fiels) => {
		if(error){
			console.log(error);
			return false;
		}
		var id = fields.id[0];
		var name = fields.name[0];
		var price = fields.price[0];
		var fee = fields.fee[0];
		var pic = fiels.pic[0].path;
		//判断是否有新传的图片，有则替换没有则不修改图片
		if(fiels.pic[0].originalFilename){
			var setData = {
				name,price,fee,pic
			}
		}else{
			var setData = {
				name,price,fee
			}
		}
		//修改数据
		DB.update('product',{'_id':new DB.ObjectID(id)},setData,(error,data) => {
			if(error){
				cosole.log(error);
				return false;
			}
			res.redirect('/product');
		})
	})
})
app.get('/delete',(req,res) => {
	var id = req.query.id;
	//删除数据
	DB.delete('product',{"_id":new DB.ObjectID(id)},(error,data) => {
		if(!error){
			res.redirect('/product');
		}
	})
})
//监听端口
app.listen('3001','127.0.0.1');