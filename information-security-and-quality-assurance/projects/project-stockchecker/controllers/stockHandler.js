const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const dbName = 'heroku_73cfqp6w';
const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true });

const apiStockUrl = 'https://cloud-sse.iexapis.com/v1/stock';
const TOKEN = process.env.TOKEN;

const instance = axios.create({
  baseURL: apiStockUrl
});

function stockHandler() {
  this.getStock = async ({ stock }, res) => {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('stocks');
    const stockData = {};
    
    try {
      const r = await instance.get(`/${stock}/quote`, {
        params: { token: TOKEN }
      });

      stockData.stock = r.data.symbol;
      delete r.data.symbol;
      
      stockData.price = r.data.latestPrice.toString();
      delete r.data.latestPrice;
      
      const doc = await col.findOne({ stock });
      if (doc) {
        stockData.likes = doc.likes.length;
      } else {
        col.insertOne({ stock: stockData.stock, likes: [] });
        stockData.likes = 0;
      }
      
      res.json({ stockData, ...r.data });
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.likeStock = async ({ stock, like }, req, res) => {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('stocks');
    const stockData = {};

    try {
      const r = await instance.get(`/${stock}/quote`, {
        params: { token: TOKEN }
      });
      
      stockData.stock = r.data.symbol;
      delete r.data.symbol;
      
      stockData.price = r.data.latestPrice.toString();
      delete r.data.latestPrice;
      
      let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      ip = ip.split(',')[0];

      if (like === 'true') {
        const hadLiked = await col.findOne({
          stock,
          likes: ip
        });
        
        if (hadLiked) {
          stockData.likes = hadLiked.likes.length;

        } else {
          const doc = await col.findOneAndUpdate(
            { stock },
            { $push: { likes: ip } },
            { upsert: true, returnOriginal: false }
          );
          stockData.likes = doc.value.likes.length;
        }
        
      } else { // unlike
        const doc = await col.findOneAndUpdate(
          { stock },
          { $pull: { likes: ip } },
          { upsert: true, returnOriginal: false }
        );
        stockData.likes = doc.value.likes.length;
      }

      res.json({ stockData, ...r.data });
      
    } catch (err) {
      res.json(err);
    }
  }
  
  this.relLikes = stocks => {
    for (let i = 0; i < stocks.length; i++) {
      const stocksCopy = JSON.parse(JSON.stringify(stocks));
      
      stocksCopy[i].likes = 0;
      const otherLikes = stocksCopy.reduce((acc, obj) => acc + obj.likes, 0);
      
      stocks[i].rel_likes = stocks[i].likes - otherLikes;
    }
    
    for (let i = 0; i < stocks.length; i++) {
      delete stocks[i].likes;
    }
    
    return stocks;
  }
  
  this.getStocks = async ({ stock }, res) => {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('stocks');
    let stockData = [];
    
    try {
      for (let i = 0; i < stock.length; i++) {
        const stockVal = {};

        const r = await instance.get(`/${stock[i]}/quote`, {
          params: { token: TOKEN }
        });
        
        stockVal.stock = r.data.symbol;
        delete r.data.symbol;

        stockVal.price = r.data.latestPrice.toString();
        delete r.data.latestPrice;

        const doc = await col.findOne({ stock: stock[i] });
        if (doc) {
          stockVal.likes = doc.likes.length;
        } else {
          col.insertOne({ stock: stockVal.stock, likes: [] });
          stockVal.likes = 0;
        }

        stockData.push(stockVal);
      }
      
      stockData = this.relLikes(stockData);
      res.json({ stockData });
      
    } catch (err) {
      res.json(err);
    }
  }

  this.likeStocks = async ({ stock, like }, req, res) => {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('stocks');
    let stockData = [];
    
    try {
      for (let i = 0; i < stock.length; i++) {
        const stockVal = {};

        const r = await instance.get(`/${stock[i]}/quote`, {
          params: { token: TOKEN }
        });
        
        stockVal.stock = r.data.symbol;
        delete r.data.symbol;

        stockVal.price = r.data.latestPrice.toString();
        delete r.data.latestPrice;
        
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.split(',')[0];
        
        if (like === 'true') {
          const hadLiked = await col.findOne({
            stock: stock[i],
            likes: ip
          });
          
          if (hadLiked) {
            stockVal.likes = hadLiked.likes.length;
            
          } else {
            const doc = await col.findOneAndUpdate(
              { stock: stock[i] },
              { $push: { likes: ip } },
              { upsert: true, returnOriginal: false }
            );
            stockVal.likes = doc.value.likes.length;
          }
          
        } else { // unlike
          const doc = await col.findOneAndUpdate(
            { stock: stock[i] },
            { $pull: { likes: ip } },
            { upsert: true, returnOriginal: false }
          );
          stockVal.likes = doc.value.likes.length;
        }
        
        stockData.push(stockVal);
      }
      
      stockData = this.relLikes(stockData);
      res.json({ stockData });
      
    } catch (err) {
      res.json(err);
    }
  }
  
}

module.exports = stockHandler;