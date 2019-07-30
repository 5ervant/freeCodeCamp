const mongoose = require('mongoose');

mongoose
.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useCreateIndex: true },
  () => {
    console.log('mongodb connected');
  }
)
.catch(err => {
  console.log(err);
});

module.exports = mongoose;
