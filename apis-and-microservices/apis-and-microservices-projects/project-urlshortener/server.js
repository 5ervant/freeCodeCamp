'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');
var { urlSchema } = require('./models/schemas');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
var Url = mongoose.model('Url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', (req, res) => {
  const { url } = req.body;

  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  const domain = matches && matches[1]; // domain will be null if no match is found

  dns.lookup(domain, (err, hostname) => {
    if (err) console.log('err', err);

    if (!hostname) return res.json({ error: 'invalid URL' });

    Url.findOne({ original: url }, (err, existed) => {
      if (err) throw err;

      if (existed) {
        res.json({
          original_url: existed.original.replace(/^https?\:\/\//i, ''),
          short_url: existed.short
        });
      } else {
        Url.findOne({}, {}, { sort: { created_at: -1 } }, function(
          err,
          lastUrl
        ) {
          if (err) throw err;

          const doc = { original: url };

          if (lastUrl) doc.short = lastUrl.short + 1;

          Url.create(doc, (err, created) => {
            if (err) throw err;

            res.json({
              original_url: created.original.replace(/^https?\:\/\//i, ''),
              short_url: created.short
            });
          });
        });
      }
    });
  });
});

app.get('/api/shorturl/:short', (req, res) => {
  Url.findOne(req.params, (err, url) => {
    if (err) throw err;

    if (url) return res.redirect(url.original);
  });
});

app.listen(port, function() {
  console.log('Node.js listening ...');
});
