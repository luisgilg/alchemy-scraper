var express = require('express');
var app     = express();

var ldiy = require("./scrapers/lediy");
var ldiy_index = require("./scrapers/lediy_index");


app.get('/scrape-recipe/:target/:recipe', function(req, res){
    var target = req.params.target;
    var recipe = req.params.recipe;
    if (!target)
    {
        res.sendStatus(404);
        return;
    }

    if(!recipe){
        res.sendStatus(404);
        return;
    }

    switch (target) {
        case "lediy":
            ldiy.scrape('recipe', recipe, (err, data)=>{
                if(err){
                    return res.sendStatus(500)
                }
                if (!data){
                    return res.sendStatus(404)                    
                }

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            })
            break;
    
        default:
            break;
    }
})

app.get('/scrape-index/:target', function(req, res){
    var target = req.params.target;   
    if (!target)
    {
        res.sendStatus(404);
        return;
    }
    switch (target) {
        case "lediy":
            ldiy_index.scrape('index', (err, data)=>{
                if(err){
                    return res.sendStatus(500)
                }
                if (!data){
                    return res.sendStatus(404)                    
                }

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            })
            break;
    
        default:
            break;
    }
});

app.listen('9081')

console.log('Magic happens on port 9081');

exports = module.exports = app;