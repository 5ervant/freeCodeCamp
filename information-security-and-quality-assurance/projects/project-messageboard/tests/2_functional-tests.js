/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  const request = chai.request(server);
  const thread_delete_password = 'thread_delete_password';
  const reply_delete_password = 'reply_delete_password';
  let threads, replies;

  const getRandomNum = () => Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('create thread', done => {
        request.post('/api/threads/fcc')
        .send({ text: `thread_text_${getRandomNum()}`, delete_password: thread_delete_password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
       
      test('create 2nd thread (we\'re going to delete the 1st one)', done => {
        request.post('/api/threads/fcc')
        .send({ text: `thread_text_${getRandomNum()}`, delete_password: thread_delete_password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('list recent threads', done => {
        request.get('/api/threads/fcc')
        .end((err, res) => {
          const { body } = res;

          assert.equal(res.status, 200);
          assert.typeOf(body, 'array');
          assert.isAtMost(body.length, 10);
          threads = body;
          
          for (let i = 0; i < body.length; i++) {
            assert.typeOf(body[i]._id, 'string');
            assert.typeOf(body[i].text, 'string');
            assert.typeOf(body[i].created_on, 'string');
            assert.typeOf(body[i].bumped_on, 'string');
            assert.notProperty(body[i], 'reported');
            assert.notProperty(body[i], 'delete_password');
          
            assert.typeOf(body[i].replies, 'array');
            assert.isAtMost(body[i].replies.length, 3);
            assert.typeOf(body[i].replycount, 'number');
          }
          
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('delete thread with incorrect password', done => {
        request.delete('/api/threads/fcc')
        .send({ _id: threads[0]._id, delete_password: 'incorrect password' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete thread with right password', done => {
        request.delete('/api/threads/fcc')
        .send({ thread_id: threads[0]._id, delete_password: thread_delete_password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
     test('report thread', done => {
        request.put('/api/threads/fcc')
        .send({ thread_id: threads[1]._id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('create reply', done => {
        request.post('/api/replies/fcc')
        .send({
          text: `reply_text_${getRandomNum()}`, delete_password: reply_delete_password, thread_id: threads[1]._id
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('show all replies on thread', done => {
        request.get('/api/replies/fcc')
        .query({ thread_id: threads[1]._id })
        .end((err, res) => {
          const { body } = res;

          assert.equal(res.status, 200);
          assert.typeOf(body.replies, 'array');
          replies = body.replies;
          
          for (let i = 0; i < body.length; i++) {
            assert.typeOf(body[i]._id, 'string');
            assert.typeOf(body[i].text, 'string');
            assert.typeOf(body[i].created_on, 'string');
            assert.notProperty(body[i], 'reported');
            assert.notProperty(body[i], 'delete_password');
          }
          
          done();
        })
      });
      
    });
    
    suite('PUT', function() {
      
     test('report reply on thread', done => {
        request.put('/api/replies/fcc')
        .send({ thread_id: threads[1]._id, reply_id: replies[0]._id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('change reply to \'[deleted]\' on thread with incorrect password', done => {
        request.delete('/api/replies/fcc')
        .send({ thread_id: threads[1]._id, reply_id: replies[0]._id, delete_password: 'incorrect password' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('change reply to \'[deleted]\' on thread with right password', done => {
        request.delete('/api/replies/fcc')
        .send({ thread_id: threads[1]._id, reply_id: replies[0]._id, delete_password: reply_delete_password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    
  });

});
