//Getting all dependencies
var express = require('express');
var ejs = require('ejs');
var NomieUOM = require('./nomie-uom');
var tz = require('tzname');
var moment = require('moment-timezone');
var passGen = require('password-generator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Setting up the port to listen to
app.set('port', (process.env.PORT || 5000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

//Setting up cookie use
app.use(cookieParser());

//Setting up session handling
app.use(session({secret: 's3cr3tsSh0uldB3K3pt'}));

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
  res.render('home');
});

app.get('/users/:publicId', (req, res) => {
  User.find({ publicId: req.params.publicId }, (err, user) => {
    if (user[0]) {
      res.render('index', {title: user[0].name, yesterdayCount: user[0].yesterdayCount, todayCount: user[0].todayCount, color: user[0].color});
      var message = `<style>
        #main {
          color: grey;
          font-size: 120px;
          text-align: center;
        }
        #count {
          font-size: 100px;
        }
      </style>
      <div id="main">
        ${user[0].name}<br />
        <div id="count">
          Today's Count: ${user[0].todayCount}<br />
          Yesterday's Count: ${user[0].yesterdayCount}
        </div>
      </div>`
    } else {
      res.send('No user found');
    }
  });
});

app.get('/join', (req, res) => {
  var config = require('./join.json');
  res.send(config);
});

app.get('/api/:publicId', (req, res) => {
  User.find({ publicId: req.params.publicId }, (err, user) => {
    if (user[0]) {
      res.send({
        status: 'success',
        title: user[0].name,
        yesterdayCount: user[0].yesterdayCount,
        todayCount: user[0].todayCount,
        monthCount: user[0].monthCount,
        color: user[0].color,
      });
    } else {
      res.send({status: 'wrong_id'});
    }
  });
});

// Determines count to display
var parseEvents = (data, timezone, tracker) => {
  var total = 0;
  var yesterdayTotal = 0;
  var monthTotal = 0;
  for(var i = 0; i < data.length; i++) {
    var rawTime = data[i].time
    var time = rawTime.substring(0, 19) + "Z";
    var format = "YYYY-MM-DDThh:mm:ssz"
    var actualTime = moment(time, format).tz(timezone).format('MM DD');
    var currentDate = moment().tz(timezone).format('MM DD');
    var yesterdayDate = moment().tz(timezone).subtract(1, 'days').format('MM DD');
    if (actualTime == currentDate) {
      total += data[i].value || 1;
    }
    if (actualTime == yesterdayDate) {
      yesterdayTotal += data[i].value || 1;
    }
    monthTotal += data[i].value || 1;
  }
  console.log('Returning expected totals');
  return {
    today: NomieUOM.displayValue(tracker.config.uom, total),
    yesterday: NomieUOM.displayValue(tracker.config.uom, yesterdayTotal),
    month: NomieUOM.displayValue(tracker.config.uom, monthTotal),
  };
}

app.post('/collect', (req, res) => {
  // TODO: Make work
  console.log(req.body);
  console.log(req.body.experiment.slots.data);
  var tzCalc = tz.getTimezoneNameByOffset(req.body.timezoneOffset);
  var userId = req.body.anonid;
  var count = parseEvents(req.body.experiment.slots.data.data, tzCalc, req.body.experiment.slots.data.tracker);
  var todayCount = count.today;
  var yesterdayCount = count.yesterday;
  var monthCount = count.month;
  User.find({ userId }, (err, users) => {
    if (users[0] && users.length == 1) {
      users[0].todayCount = todayCount;
      users[0].yesterdayCount = yesterdayCount;
      users[0].monthCount = monthCount;
      users[0].name = req.body.experiment.info.title.value;
      users[0].color = req.body.experiment.color;
      users[0].lastSync = Date();
      users[0].save();
      var publicId = users[0].publicId;
      ejs.renderFile('./views/results.ejs', {
        id: publicId,
        todayCount,
        yesterdayCount,
        monthCount,
        experiment: req.body.experiment
      }, {}, function(err, str){
        if (err) {
          console.log(err);
        }
        res.send({ html: str });
      });
    } else if (!users[0]) {
      var publicId = passGen(12, false);
      var newUser = User({
        publicId,
        userId,
        name: req.body.experiment.info.title.value,
        color: req.body.experiment.color,
        todayCount: todayCount,
        yesterdayCount: yesterdayCount,
        monthCount: monthCount,
        lastSync: Date(),
      });
      newUser.save();
      ejs.renderFile('./views/results.ejs', {
        id: publicId,
        todayCount,
        yesterdayCount,
        monthCount,
        experiment: req.body.experiment
      }, {}, function(err, str){
        if (err) {
          console.log(err);
        }
        res.send({ html: str });
      });
    }
  });
});

app.get('/leave', (req, res) => {
  // TODO: Delete saved user data
});

io.sockets.on('connection', function(socket) {
  /*
  socket.on('test', function(data) {
    var data = [];
    io.emit('testsend', data);
  }
   */
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});
