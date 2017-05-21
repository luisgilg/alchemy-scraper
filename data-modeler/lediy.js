var Promise = require("bluebird");
var config = require('../config');
var log = require('../log')
var dbs = require('../dbs');
var fs = require('fs');

var readdir = Promise.promisify(fs.readdir);
var readFile = Promise.promisify(fs.readFile);
var rename = Promise.promisify(fs.rename);

var {sep} = require('path');
var {data_path} = config;
var {get_key} = config;


var app = {
    transform_all:function(){
        var self = this;
        log.debug("transform_all", data_path)
        return new Promise((resolve, reject)=>{            
            return readdir(data_path)
            .map(file=>{
                return self.transform_one(file);
            }, {concurrency: 1}).then(resolve,reject);
        });
        // readdir(data_path).then((files)=>{
        //     var keys = [];
        //     var promises = [];
        //     files.forEach((file)=>{
        //         var fileKey = file.replace('.json','');
        //         keys.push(fileKey);
        //         promises.push(this.transform_one(fileKey));     
        //     });
        //     Promise.all(promise).then(promise.resolve);
        // });
        //var keys = []
        //return promise;
    },
    transform_one:function(file){
        var self = this;
        var key = file.replace('.json','');
        log.debug("transform_all", {file:file, key:key})
        
        return new Promise((resolve, reject) => {
            self.find_key('recipes', key).then((err, doc)=>{
                if(err || doc){
                    return resolve({
                        key:key,
                        status:'exist'
                    });
                }

                var filePath = data_path + sep + file;                
                readFile(filePath).then(data=>{
                    try{
                        var obj = JSON.parse(data);
                        return self.create_model(obj, filePath)
                            .then(resolve, reject);
                    }catch(ex){
                        log.error("parsing error", {filePath:filePath})
                        fs.unlink(filePath,(err)=>{
                            log.info("deleted file", {filePath:filePath});
                           return resolve({
                                key:key,
                                status:'parsing error',
                                filePath:filePath
                            });
                        })
                    }
                }, reject)
            },reject);
        });
    },
    find_key:function(collection, key){
       log.debug("find_key", {collection:collection, key:key})
        
       return new Promise((resolve, reject) => {
           dbs.run().then(db => {
               db.collection(collection).findOne({
                   keys:key
                }).then(resolve, reject);
            },reject)
        });
    },
    parse_items: function(name, collection, items){
        var self = this;        
        log.debug('parse_items', items)
        return new Promise((resolve, reject)=>{
            var promises = [];
            
            items.forEach((item)=>{
                promises.push(new Promise((resolve_2, reject_2)=>{
                    var key = get_key(item.href);
                    self.find_key(collection, key).then((doc)=>{
                        if (doc) {
                            log.debug(name + " exist", doc)                            
                            return resolve_2(doc);
                        }
                        var newItem = {
                            keys : [key],
                            original_name : item.text.trim()
                        };

                        log.debug("creating " + name, newItem)                        
                        dbs.run().then((db)=>{
                            db.collection(collection)
                            .insert(newItem)
                            .then((obj)=>{return resolve_2(newItem)}, (err)=>{return reject_2(err)});
                        },reject_2)
                    }, reject)
                }));
            });

            Promise.all(promises).then(resolve,reject);
        });
    },

    create_model:function(obj, filePath){
        var self = this;
        log.debug('create_model', {filePath:filePath})

        return new Promise((resolve, reject)=>{
            var keys = [obj.key];
            var original_name = obj.title;
            var styles = [];
            self.parse_items('style','styles',obj.styles).then((new_styles)=>{
                log.debug('all styles', new_styles)
                obj.fabricant = obj.fabricant || [];
                
                if (obj.fabricant.length>1){
                    obj.fabricant = [obj.fabricant[0]];
                }

                self.parse_items('fabricant','recipe_trademarks',obj.fabricant).then((new_trademarks)=>{
                    log.debug('all recipe_trademarks', new_trademarks)
                    resolve(new_trademarks);                    
                },reject)
            }, reject);

            //resolve(obj);
        })
    },
}

exports = module.exports = app;

