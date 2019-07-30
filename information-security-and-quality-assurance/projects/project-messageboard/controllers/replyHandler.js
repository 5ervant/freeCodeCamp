const db = require('../models/db');
const { threadSchema } = require('../models/schemas');

function replyHandler() {
  
  this.createReply = async (req, res) => {
    const { board } = req.params;
    const { text, delete_password, thread_id } = req.body;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const thread = await Thread.findByIdAndUpdate(thread_id, {
        $push: { replies: { text, delete_password } }
      });
      
      res.redirect(`/b/${board}/${thread_id}`);
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.replyList = async (req, res) => {
    const { board } = req.params;
    const { thread_id } = req.query;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const thread = await Thread.findById(
        thread_id,
        { reported: 0, delete_password: 0, 'replies.reported': 0, 'replies.delete_password': 0 }
      );
      
      res.json(thread);
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.deleteReply = async (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id, delete_password } = req.body;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
//       const r = await Thread.update(
//         { _id: thread_id, 'replies._id': reply_id, 'replies.delete_password': delete_password },
//         { $pull: { replies: { _id: reply_id, delete_password } } }
//       );
      
//       if (r.nModified) res.send('success');
//       else res.send('incorrect password');
      
      const thread = await Thread.findOne(
        { _id: thread_id, 'replies._id': reply_id, 'replies.delete_password': delete_password }
      );
      
      if (thread) {
        for (let i = 0; i < thread.replies.length; i++) {
          const reply = thread.replies[i];
          
          if (reply._id.equals(reply_id) && reply.delete_password === delete_password) {
            thread.replies[i].text = '[deleted]';
            await thread.save();
            return res.send('success');
          }
        }
      } else {
        res.send('incorrect password')
      }
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.reportReply = async (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id } = req.body;
    
    const Thread = db.model('Thread', threadSchema, board);
    
    try {
      const r = await Thread.update(
        { _id: thread_id, 'replies._id': reply_id },
        { $set: { 'replies.$.reported': true } }
      );
      
      if (r.nModified) res.send('success');
      
    } catch (err) {
      res.json(err);
    }
  }
  
}

module.exports = replyHandler;
