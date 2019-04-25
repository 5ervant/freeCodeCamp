const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { userSchema, exerciseSchema } = require('./models/schemas');

const cors = require('cors');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/exercise-track',
  { useMongoClient: true }
);

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body;

  if (!username) return res.send('<pre>Path `username` is required.</pre>');

  User.create({ username }, (err, created) => {
    if (err) return res.send('<pre>username already taken</pre>');

    res.json({ username, _id: created._id });
  });
});

app.get('/api/exercise/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw err;

    res.json(users);
  });
});

app.post('/api/exercise/add', (req, res) => {
  const { userId, description, date } = req.body;
  let { duration } = req.body;
  const errors = {};

  if (!userId) errors.userId = '`userId` is required.';
  if (!description) errors.description = '`description` is required.';

  if (!duration) errors.duration = '`duration` is required.';
  duration = parseInt(duration);
  if (!duration)
    errors.duration = `Cast to Number failed for value "${
      req.body.duration
    }" at path "duration"`;

  if (Object.keys(errors).length) return res.json({ errors });

  User.findById(userId, (err, user) => {
    if (err) throw err;

    if (!user) return res.send('<pre>unknown _id</pre>');

    const newExercise = { userId: user._id, description, duration };
    newExercise.date = date ? new Date(date) : new Date();

    Exercise.create(newExercise, (err, added) => {
      if (err) throw err;

      res.json({
        username: user.username,
        description: added.description,
        duration: added.duration,
        _id: added.userId,
        date: added.date.toDateString()
      });
    });
  });
});

app.get('/api/exercise/log', (req, res) => {
  const { userId, from, to, limit } = req.query;

  User.findById(userId, (err, user) => {
    if (err) throw err;

    if (!user) return res.send('<pre>unknown userId</pre>');

    const portfolio = {
      _id: user._id,
      username: user.username
    };

    if (from) portfolio.from = new Date(from).toDateString();

    const query = { userId };

    if (from) {
      if (!query.date) query.date = {};

      query.date['$gte'] = new Date(from);
    }

    if (to) {
      if (!query.date) query.date = {};

      query.date['$lt'] = new Date(to);
    }

    Exercise.find(query, { _id: 0, description: 1, duration: 1, date: 1 })
      .limit(parseInt(limit))
      .exec((err, exercises) => {
        if (err) throw err;

        portfolio.count = exercises.length;
        portfolio.log = [];

        exercises.forEach(o => {
          portfolio.log.push({
            description: o.description,
            duration: o.duration,
            date: o.date.toDateString()
          });
        });

        res.json(portfolio);
      });
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: 'not found' });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res
    .status(errCode)
    .type('txt')
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
