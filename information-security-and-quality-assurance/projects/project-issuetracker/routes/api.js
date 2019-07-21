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
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
// const dbName = 'heroku_73cfqp6w';
const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true });

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res){
      const { project } = req.params;
      const { query } = req;
    
      if (query.open)
        query.open = query.open !== 'false';
    
      try {
        await client.connect();
        const db = client.db();
        
        const docs = await db.collection(project).find(query).toArray();
        res.json(docs);
        
      } catch (err) {
        console.log(err.stack);
      }
    })

    .post(async function (req, res){
      try {
        await client.connect();
        const db = client.db();
      
        const { project } = req.params;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

        if (!issue_title) res.send('issue_title required');
        if (!issue_text) res.send('issue_text required');
        if (!created_by) res.send('created_by required');

        
        const newEntry = {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        }

        let r = await db.collection(project).insertOne(newEntry);
        res.json(r.ops[0]);
        
      } catch (err) {
        console.log(err.stack);
      }
    })

    .put(async function (req, res){
      const { project } = req.params;
      let { _id, ...updates } = req.body;
      
      for (var ele in updates) { if (!updates[ele]) { delete updates[ele] } }
      if (!_id || Object.keys(updates).length === 0)
        return res.send('no updated field sent');
    
      try {
        await client.connect();
        const db = client.db();
        
        let r = await db.collection(project).findOneAndUpdate(
          { _id: ObjectId(_id) },
          {
            $set: { ...updates, open: updates.open !== 'false' },
            $currentDate: { updated_on: { $type: 'date' } } 
          }
        );
        
        if (r.lastErrorObject.updatedExisting)
          res.send('successfully updated');
        
      } catch (err) {
        res.send(`could not update ${_id}`);
      }
      
      res.json(req.body);
    })

    .delete(async function (req, res){
      const { project } = req.params;
      const { _id } = req.body;
    
      if (!_id)
        return res.send('_id error');
    
      try {
        await client.connect();
        const db = client.db();
        
        await db.collection(project).deleteOne({ _id: ObjectId(_id) });
        res.send(`deleted ${_id}`);
        
      } catch (err) {
        res.send(`could not delete ${_id}`);
      }

    });

};
