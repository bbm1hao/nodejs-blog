var mongodb = require('./db');

function User(user){
	this.username = user.username;
	this.password = user.password;
}

module.exports = User;

User.prototype.save = function(callback){
	var user = {
		username : this.username,
		password : this.password
	}

	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.ensureIndex('username', {unique: true});
			collection.insert(user, {safe: true}, function(err, user){
				mongodb.close();
				callback(err, user);
			});
		});
		
	});
}

User.get = function (username, callback){
	mongodb.open(function(err, db){
		if (err) {
			return callback(err);
		};

		db.collection('users', function(err, collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};

			collection.findOne({username : username}, function(err, doc){
				mongodb.close();
				if (doc) {
					var user = new User(doc);
					callback(err, user);
				}else{
					callback(err, null);
				}
			});
		});
	});
}
