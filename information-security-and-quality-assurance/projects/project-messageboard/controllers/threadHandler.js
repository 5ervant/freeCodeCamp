const db = require('../models/db');
const { threadSchema } = require('../models/schemas');

function threadHandler() {
  
  this.createThread = async (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const thread = await Thread.create({ text, delete_password });
      res.redirect(`/b/${board}`);
      
    } catch (err) {
      res.json(err);
    }
  };
  
  this.threadList = async (req, res) => {
    const { board } = req.params;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const threads = await Thread.aggregate([
        { $project: {
          _id: 1, text: 1, created_on: 1, bumped_on: 1,
          replies: { _id: 1, text: 1, created_on: 1 },
          replycount: { $size: '$replies' }
        } },
        { $sort: { bumped_on: -1 } },
        { $limit: 10 }
      ]);
      
      for (let i = 0; i < threads.length; i++) {
        threads[i].replies
          .sort((a, b) => b.created_on - a.created_on)
          .splice(5);
      }
      
      res.json(threads);
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.deleteThread = async (req, res) => {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const thread = await Thread.findOneAndRemove({ _id: thread_id, delete_password });
      
      if (thread) res.send('success');
      else res.send('incorrect password');
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.reportThread = async (req, res) => {
    const { board } = req.params;
    const { thread_id } = req.body;

    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const r = await Thread.update({ _id: thread_id }, { reported: true });
      
      if (r.nModified) res.send('success');
      
    } catch (err) {
      res.json(err);
    }
  }
  
}

module.exports = threadHandler;
