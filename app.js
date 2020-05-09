const express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    users = require('./users.json'),
    path = require('path'),
    mustacheExpress = require('mustache-express');;

module.exports.loadUI = app => {
    app.engine('html', mustacheExpress());
    app.set('views', path.join(__dirname, 'client'));
    app.set('view engine', 'html');
}


module.exports.parsers = app => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
}

module.exports.initSession = app => {
    app.use(session({
        secret: 'TOP SECRET',
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 60000 }
    }))
}

module.exports.routes = app => {

    app.get('/', (req, res) => {
        if(req.session.user)
            return res.redirect('/home');
        else
            return res.render('index');
    });

    app.post('/login', (req, res) => {
        let body = req.body;
        if (body.username && body.password) {
            if (users.hasOwnProperty(body.username)) {
                if (users[body.username] == body.password) {
                    req.session.user = body.username;
                    return res.redirect('/home');
                } else
                    return res.render('index', { error: true, message: 'Invalid Password' });
            } else
                return res.render('index', { error: true, message: 'Invalid Username/Password' });
        } else {
            return res.render('index', { error: true, message: 'Username/Password should not be empty' })
        }
    });

    app.get('/home', isAuthenticated, (req, res) => {
        return res.render('home', {user: req.session.user});
    });

    app.get('/logout',  (req, res) => {
       req.session.destroy();
       return res.redirect('/');
    });

    function isAuthenticated(req, res, next){
        if(req.session.user)
            next();
        else return res.redirect('/');
    }

    app.get('*', function(req, res){
        res.render('404', {url: req.originalUrl})
      });
}

module.exports.init = () => {
    let app = express();
    this.parsers(app);
    this.initSession(app);
    this.loadUI(app);
    this.routes(app)
    app.set('port', process.env.PORT || 3000)
    return app;
}
