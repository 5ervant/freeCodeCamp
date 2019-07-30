/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ThreadHandler = require('../controllers/threadHandler');
var ReplyHandler = require('../controllers/replyHandler');

module.exports = function (app) {
  
  const threadHandler = new ThreadHandler();
  const replyHandler = new ReplyHandler();
  
  app.route('/api/threads/:board')
  .post(threadHandler.createThread)
  .get(threadHandler.threadList)
  .delete(threadHandler.deleteThread)
  .put(threadHandler.reportThread);
  
  app.route('/api/replies/:board')
  .post(replyHandler.createReply)
  .get(replyHandler.replyList)
  .delete(replyHandler.deleteReply)
  .put(replyHandler.reportReply);
  
};
