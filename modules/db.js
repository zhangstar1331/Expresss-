//封装数据库方法
//引入mongodb下面的MongoClient连接数据库  安装：npm install mongodb --save  注意版本，3.0之后的要用新的写法，否则会报db.collection is not function
var MongoClient = require('mongodb').MongoClient;
//定义数据库连接的地址
var url = 'mongodb://127.0.0.1:27017/store';
//将id转化为mongo库中的ObjectID
var ObjectID = require('mongodb').ObjectID;
function connectMongo(callback){
	//连接数据库
	MongoClient.connect(url,(err,client) => {
		if(err){
			console.log('连接数据库失败');
			return false;
		}
		var db = client.db('store');
		callback(db,client)

	})
}
//暴露ObjectID
exports.ObjectID = ObjectID;
//查找数据
exports.find = function(collectionName,json,callback){//集合名、查找条件
	connectMongo((db,client) => {
		//查询数据库
		var result = db.collection(collectionName).find(json);
		//将result转化为对象数组
		result.toArray(function(error,data){
			callback(error,data);
			//关闭数据库
			client.close();
		})
	})
} 
//修改数据
exports.update = function(collectionName,json1,json2,callback){//集合名、查找条件
	connectMongo((db,client) => {
		//更改数据库中的数据
		var result = db.collection(collectionName).updateOne(json1,{$set:json2},function(error,data){
			callback(error,data);
			//关闭数据库
			client.close();
		});
	})
} 
//增加数据
exports.insert = function(collectionName,json,callback){//集合名、查找条件
	connectMongo((db,client) => {
		//向数据库中插入数据
		var result = db.collection(collectionName).insertOne(json,function(error,data){
			callback(error,data);
			//关闭数据库
			client.close();
		});
	})
}
//删除数据
exports.delete = function(collectionName,json,callback){//集合名、查找条件
	connectMongo((db,client) => {
		//删除数据库中的数据
		var result = db.collection(collectionName).deleteOne(json,function(error,data){
			callback(error,data);
			//关闭数据库
			client.close();
		});
	})
}