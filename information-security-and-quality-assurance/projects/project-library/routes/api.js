/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const dbName = 'heroku_73cfqp6w';
const client = new MongoClient(MONGODB_CONNECTION_STRING, { useNewUrlParser: true });

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    
      await client.connect();
      const db = client.db(dbName);
    
      try {
        let r = await db.collection('books').aggregate([
          {
            $project: { title: 1, comments: 1 }
          },
          {
            $addFields: {
              commentcount: { $size: "$comments" }
            }
          },
        ]).toArray();

        res.json(r);
        
      } catch (err) {
        console.log(err.stack);
      }
    })
    
    .post(async function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    
      if (!title) return res.send('missing title');
    
      await client.connect();
      const db = client.db(dbName);
      
      try {
        let r = await db.collection('books').insertOne({ title, comments: [] });
        res.json(r.ops[0]);
        
      } catch (err) {
        console.log(err.stack);
      }
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
    
      await client.connect();
      const db = client.db(dbName);
    
      try {
        await db.collection('books').remove();
        res.send('complete delete successful');
        
      } catch (err) {
        console.log(err.stack);
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
      if (!ObjectId.isValid(bookid))
        return res.send('no book exists');
    
      await client.connect();
      const db = client.db(dbName);
      
      try {
        let r = await db.collection('books').findOne({ _id: ObjectId(bookid) });
        
        if (!r) return res.send('no book exists');
        
        if (!r.comments) r.comments = [];
        
        res.json(r);
        
      } catch (err) {
        console.log(err.stack);
      }
    })
    
    .post(async function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    
      await client.connect();
      const db = client.db(dbName);
      
      try {
        let r = await db.collection('books').findOneAndUpdate(
          { _id: ObjectId(bookid) },
          { $push: { comments: comment } },
          { returnOriginal: false }
        );
        
        res.json(r.value);
        
      } catch (err) {
        console.log(err.stack);
      }
    })
    
    .delete(async function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    
      await client.connect();
      const db = client.db(dbName);
    
      try {
        await db.collection('books').findOneAndDelete({ _id: ObjectId(bookid) });
        res.send('delete successful');
        
      } catch (err) {
        console.log(err.stack);
      }
    });
  
};
