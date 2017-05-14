var request = require('request');
var cheerio = require('cheerio');

const target_host = "https://www.lediypourlesnuls.com";


var app = {
    scrape: function(type, done){
        switch (type) {
            case 'index':
            return scrape_index(done)
            break;
        
            default:
            return done("error scrapping", null)
            break;
        }
    }
}

exports = module.exports = app;

function scrape_index(done) {
    var url = target_host + "/recettes/";

    request(url, function(error, response, html){
        if(error){
            return done(error, null)
        }

        var $ = cheerio.load(html);

        var result = [];

        var pushLinks = function(selector, array){
            $(selector).each((index, element)=>{
                var $element = $(element);
                array.push({text:$element.text(),href:$element.attr("href")});
            })
        }       

        pushLinks(".wpurp-index-container a", result);
        
        return done(null, result);

    })
}