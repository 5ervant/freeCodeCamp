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
    
    let prevLikes;
    let prevStockData;
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          //complete this one too
          
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          const { stockData } = res.body;
          assert.typeOf(stockData, 'object');
          assert.typeOf(stockData.stock, 'string');
          assert.typeOf(stockData.price, 'string');
          assert.typeOf(stockData.likes, 'number');
          done();
        });
      });
      
      test('TO RESET: UNLIKE 2 STOCKS', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'], like: false })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          const { stockData } = res.body;
          assert.typeOf(stockData, 'object');
          assert.typeOf(stockData.stock, 'string');
          assert.typeOf(stockData.price, 'string');
          assert.typeOf(stockData.likes, 'number');
          prevLikes = stockData.likes;
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          const { stockData } = res.body;
          assert.typeOf(stockData, 'object');
          assert.typeOf(stockData.stock, 'string');
          assert.typeOf(stockData.price, 'string');
          assert.typeOf(stockData.likes, 'number');
          assert.equal(stockData.likes, prevLikes);
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'] })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          const { stockData } = res.body;
          assert.typeOf(stockData, 'array');
          assert.typeOf(stockData[0].stock, 'string');
          assert.typeOf(stockData[0].price, 'string');
          assert.typeOf(stockData[0].rel_likes, 'number');
          prevStockData = stockData;
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'], like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          const { stockData } = res.body;
          assert.typeOf(stockData, 'array');
          
          for (let i = 0; i < stockData.length; i++) {
            assert.typeOf(stockData[i].stock, 'string');
            assert.typeOf(stockData[i].price, 'string');
            assert.typeOf(stockData[i].rel_likes, 'number');
            
            if (prevStockData[i].rel_likes > 0)
              assert.equal(stockData[i].rel_likes, prevStockData[i].rel_likes - 1);
            else if (prevStockData[i].rel_likes < 0)
              assert.equal(stockData[i].rel_likes, prevStockData[i].rel_likes + 1);
          }
          
          done();
        });
      });
      
    });

});
