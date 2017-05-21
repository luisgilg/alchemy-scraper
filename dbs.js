var Promise = require("bluebird");
var config = require('./config');
var log = require('./log')

var mongoClient = require('mongodb').MongoClient

var {mongo_url} = config;
var openPromise;

var app = {
    db:null,
    open:function(){
        var self = this;
        if  (openPromise){
            log.debug("openPromise", {mongo_url:mongo_url});
            return openPromise;
        }

        openPromise = new Promise((resolve, reject)=>{
            if (self.db){
                return resolve(self.db);
            }

            log.debug("opendb", {mongo_url:mongo_url})


            return mongoClient.connect(mongo_url).then((db)=>{
                log.debug("opendb-conected", {mongo_url:mongo_url})
                self.db = db;
                return resolve(db);
            },(err)=>{
                log.error("opendb-error", {mongo_url:mongo_url, err:err})                
                return reject(err)
            });
        });

        return openPromise;
    },
    run:function(){
        var self = this;

        return new Promise((resolve, reject)=>{
            if (self.db){
                return resolve(self.db);
            }

           return self.open()
           .then(resolve, reject);
        });
    },
    close:function(){
        if (this.db){
            return db.close();
        }
    }
}

exports = module.exports = app;
