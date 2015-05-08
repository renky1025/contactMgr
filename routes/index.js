var express = require('express');
var router = express.Router();

var uuid = require("node-uuid");
var mongoose = require('mongoose');
var config = require('../config'); 
var db = mongoose.createConnection(config.db.mongodb);
// Schema 结构
var mongooseSchema = new mongoose.Schema({
    _id: {type: String, default: uuid.v1},
    name  : {type : String, default : '匿名用户'},
    email    : {type : String},
    phone  : {type : String},
    time     : {type : Date, default: Date.now},
    age      : {type : Number}
});
var collectionName = "contactsCollection";
var mongooseModel = db.model(collectionName, mongooseSchema);

/* GET home page. */

router.get('/', function(req, res, next) { // list contents
    var criteria = {}; // 查询条件
    var fields   =  {name:1,email:1,_id:1,phone:1,age:1,time:1}; // 待返回的字段
    var options  = {};
    mongooseModel.find( {}, function(error, result){
        if(error) {
            console.log(error);
        } else {
        	console.log(result);
           res.render('index',{"title":"Contacts Management","contactList":result});
        }
    });

});

router.get('/createcontact', function(req, res, next) {
  res.render('create', { title: 'Add New Contact' });
});

router.post('/add', function(req, res) {
	console.log(req.body);
	if(req.body.id){
	console.log("---------------------------edit --------------------");
		var conditions = {_id : req.body.id};
		var update     = {$set : {age : req.body.age, name : req.body.name, email:req.body.email, phone:req.body.phone}};
		var options    = {upsert : true};
		mongooseModel.update(conditions, update, options, function(error){
		    if(error) {
		        console.log(error);
		    } else {
		        res.send('Update OK!: "' +req.params.id+ '".');
		    }
		});
	}else{
		if(req.body.name &&  req.body.email &&  req.body.phone){
		      var doc = { name  :  req.body.name, email    : req.body.email, phone  : req.body.phone };
	 	      var mongooseEntity = new mongooseModel(doc);
	                    mongooseEntity.save(function(error) {
	                        if(error) {
	                            res.send('saved error!:  save mongodb error.');
	                        } else {
	                            res.send('saved OK!: "' + doc.name + '".');
	                        }
	                    });
		}else{
			res.send('saved error!:  Please fill required fields.');
		}
	}

});

router.get('/edit/:id', function(req, res, next) { // list contents

	if(req.params.id){
	    var criteria = {_id:req.params.id}; // 查询条件
	    var fields   = {name:1,email:1,_id:1,phone:1,age:1,time:1}; // 待返回的字段
	    var options  = {};
	    mongooseModel.find(criteria, fields, options, function(error, result){
	        if(error) {
	            console.log(error);
	        } else {
	          console.log(result);
	           res.render('edit',{"title":'Edit Contact '+req.params.id,"Contact":result[0]});
	        }

	    });
	}else{
		res.send('saved error!: Please correct the url.');
	}
});
router.get('/delete/:id', function(req, res, next) { // list contents
	if(req.params.id){
		var conditions = {_id: req.params.id};
		mongooseModel.remove(conditions, function(error){
		    if(error) {
			res.send(error);
			console.log(error);
		    } else {
			res.send('delete ok!'+ req.params.id);
		    }
	
		});
	}else{
		res.send('saved error!: Please correct the url.');
	}
});

module.exports = router;
