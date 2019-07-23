/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var stockHandler = require('../controllers/stockHandler');

module.exports = function (app) {
  
  const StockHandler = new stockHandler();

  app.route('/api/stock-prices')
    .get(function (req, res) {
      const { stock, like } = req.query;
    
      if (stock && !Array.isArray(stock)) {
        if (!like)
          StockHandler.getStock({ stock }, res);
        else
          StockHandler.likeStock({ stock, like }, req, res);
        
      } else {
        if (!like)
          StockHandler.getStocks({ stock }, res);
        else
          StockHandler.likeStocks({ stock, like }, req, res);
      }
    });
    
};
