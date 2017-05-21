var app = {
    data_path: 'C:\\my\\alchemy-data\\recipes',
    lediy_index_scraper:'http://localhost:9081/scrape-index/lediy',
    lediy_recipe_scraper:'http://localhost:9081/scrape-recipe/lediy',
    //mongo_url:'mongodb://171.17.0.2:27017/aclhemy-diary',
    //mongo_url:'mongodb://172.17.0.2:27017/local',
    mongo_url:'mongodb://127.0.0.1:27017/aclhemy-diary',
    
    fails_path : 'C:\\my\\alchemy-data\\fails',
    get_key: function(url){
        return url.split('/')[4];
    }
}

exports = module.exports = app;