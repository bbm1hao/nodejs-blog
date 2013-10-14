var mongodb = require('./db');

function Post(username, post, time){
	this.username = username;
	this.post = post;
	if (time) {
		this.time = time;
	}else{
		this.time = new Date();
	}
	
}

module.exports = Post;

Post.prototype.save = function(callback){
	var post = {
		username : this.username,
		post : this.post,
		time : this.time
	}

	mongodb.open(function(error, db){
		if (error) {
			return callback(error);
		}

		db.collection('posts', function(error, collection){
			if (error) {
				mongodb.close();
				return callback(error);
			};

			collection.ensureIndex('username');
			collection.insert(post, {safe: true}, function(error, post){
				mongodb.close();
				return callback(error, post);
			});
		});
	});
}

Post.get = function(username, callback){

	mongodb.open(function(error, db){
		if (error) {
			return callback(error);
		};

		db.collection('posts',{safe:true}, function(error, collection){
			if (error) {
				mongodb.close();
				return callback(error);
			}

			var query = {};
			if (username) {
				query.username = username
			}

			collection.find(query).sort({time: -1}).toArray(function(error, docs){
				mongodb.close();
				if (error) {
					return callback(error);
				};

				var posts = [];
				docs.forEach(function(doc, index){
					// console.log(index);
					var post = new Post(doc.username, doc.post, doc.time);
					posts.push(post);
				});
				// console.log(docs);

				return callback(null, posts);
			});
		});
	});
}