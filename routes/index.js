
/*
 * GET home page.
 */
var User = require('../models/user.js');
var Post = require('../models/post.js');
module.exports = function(app){
	app.get('/', function(req, res){
 		res.render('index', { title: '首页' });
	});

	app.get('/reg', function(req, res){
		res.render('reg',{title: '注册'})
	});

	app.post('/reg', function(req, res){
		var form = req.body;
		var username = form['username'];
		var password = form['password'];
		var re_password = form['re-password'];

		if (password != re_password) {
			req.flash('error', '两次口令输入不一致');
			return res.redirect('/reg');
		};

		// var md5 = crypto.createHash('md5');
		// password = md5.update(password).digest('base64');
		var newUser = new User({
			username : username,
			password : password
		});

		console.log(newUser);

		User.get(newUser.username, function(error, user){
			if(user){
				error = 'username is exsited';
			}
			if (error) {
				req.flash('error', error);
				return res.redirect('/reg');
			};

			newUser.save(function(error){
				if (error) {
					req.flash('error', error);
					return res.redirect('/reg');
				};

				req.session.user = newUser;
				req.flash('success', '注册成功');
				res.redirect('/');
			});
		});
	});

	app.get('/login', function(req, res){
		res.render('login',{title: '登陆'});
	});

	app.post('/login', function(req, res){
		var form = req.body;
		var username = form['username'];
		var password = form['password'];
		// console.log(username);
		User.get(username, function(error, user){
			if(!user){
				req.flash('error','用户名不存在');
				return res.redirect('/login');
			}

			if(user.password != password){
				req.flash('error', '密码错误');
				return res.redirect('/login');
			}

			req.session.user = user;
			req.flash('success', '登陆成功');
			res.redirect('/');
		});
	});

	app.get('/logout', function(req, res){
		req.session.user = null;
		req.flash('success', '退出成功');
		res.redirect('/');
	});

	app.post('/post', checkLogin);
	app.post('/post', function(req, res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.username, req.body.post);
		post.save(function(error){
			if (error) {
				req.flash('error', error);
				return res.redirect('/');
			}
			req.flash('success','发布成功');
			return res.redirect('/u/'+currentUser.username);
		});

	});

	app.get('/u/:user', function(req, res){
		User.get(req.params.user, function(error, user){

			if (error) {
				req.flash('error', '用户名不存在');
				return res.redirect('/');
			}
			console.log(req.params.user);
			Post.get(req.params.user, function(error, posts){
				res.render('user', {
					title : user.username,
					posts : posts
				});
			});
		});


	});

}


function checkLogin(req, res, next){
	if (!req.session.user) {
		req.flash('error', '未登录');
		return res.redirect('/login');
	};
	next();
}

function checkNotLogin(req, res, next){
	if (req.session.user) {
		req.flash('error', '已登录');
		return res.redirect('/');
	};
	next();
}
