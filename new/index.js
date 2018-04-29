//Getting all dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passGen = require('password-generator');

//Setting up the port to listen to
app.set('port', (process.env.PORT || 5000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

//Setting up cookie use
app.use(cookieParser());

//Setting up session handling
app.use(session({secret: 'this_is_not_secret_actually_but_right_now_it_doesnt_matter'}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setup DB
var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	userId: String,
  publicId: String,
  name: String,
  color: String,
  todayCount: Number,
  yesterdayCount: Number,
  monthCount: Number,
  lastSync: String,
});
const User = mongoose.model('User', userSchema);
const db = mongoose.connect(process.env.MONGO_DB_URL);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:userId', (req, res) => {
  var mockData = {
    id: req.params.userId,
    title: 'Mock Data',
    backgroundColor: 'black',
    todayCount: 10,
    yesterdayCount: 6,
    monthCount: 37,
    color: 'blue'
  };
  res.render('results', mockData);
});

app.post('/data/:userId', (req, res) => {
  // Add saving of data
  res.send({ status: 'success' });
});

io.on('connection', function(socket) {
  socket.emit('online');
  socket.on("senddata", function(userdata) {
    User.find({ userId: userdata.id }, (err, user) => {
      if (user.length > ) {
        user[0].monthCount = userdata.monthCount;
        user[0].save();
      } else {
        var newUser = new User({
          userId: userdata.id,
          publicId: "to_be_supported",
          name: "to_be_supported",
          color: "blue",
          todayCount: 0,
          yesterdayCount: 0,
          monthCount: userdata.monthCount,
          lastSync: Date.now()
        });
        newUser.save();
      }
    });
  });
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

