var request = require('request');
var cheerio = require('cheerio');

const target_host = "https://www.lediypourlesnuls.com";


var app = {
    scrape: function(type, input, done){
        switch (type) {
            case 'recipe':
            return scrape_recipe(input, done)
            break;
        
            default:
            return done("error scrapping", null)
            break;
        }
    }
}

exports = module.exports = app;

function scrape_recipe(recipe, done) {
    var url = target_host + "/" + recipe + "/amp";
    request(url, function(error, response, html){
        if(error){
            return done(error, null)
        }

        var $ = cheerio.load(html);

        var result = 
        { 
            key:recipe,
            title:$("body > article > header > h1").text(),
            image:$("body > article > figure > amp-img > img").attr("src"),
            styles: [], // {title, url} .wpurp-recipe-tags .wpurp-recipe-tags-style
            marque:[],            
            fabricant:[], //.wpurp-recipe-tags .wpurp-recipe-tags-fabricant
            steeping:[], //.wpurp-recipe-tags .wpurp-recipe-tags-steeping,
            author:{
                text:'',
                href:''
            }, //.wpurp-contaier > div > div:nth-child(1) > div > div:nth-child(6)
            base: {
                PG:'',
                VG:''
            },
            ingredients:[],
            aditives:[],
            bases:[],
            flacon:{
                value:'', 
                unit:''
            }
        };

        var pushLinks = function(selector, array){
            $(selector).each((index, element)=>{
                var $element = $(element);
                array.push({text:$element.text(),href:$element.attr("href")});
            })
        }
        

        pushLinks(".wpurp-recipe-tags .wpurp-recipe-tags-style a", result.styles);
        pushLinks(".wpurp-recipe-tags .wpurp-recipe-tags-fabricant a", result.fabricant);
        pushLinks(".wpurp-recipe-tags .wpurp-recipe-tags-marque a", result.marque);
        pushLinks(".wpurp-recipe-tags .wpurp-recipe-tags-steeping a", result.steeping);

        
        result.flacon.value =  $('span:contains("Flacon")').next().text();
        result.flacon.unit =  $('span:contains("Flacon")').next().next().text();
        
        result.author.text =  $('span:contains("Auteur")').next().next().text();

        result.author.href =  $('span:contains("Auteur")').next().next().find("a").first().attr("href");


        result.base.PG = $('span.wpurp-title:contains("Base PG")').next().text().replace("/","").trim();
        result.base.VG = $('span.wpurp-title:contains("Base PG")').next().next().text().replace("/","").trim();
        
        var pushIngredient = function(selector, array){
            $(selector).each((index, element)=>{
                var ingredient = {
                    quantity:'',
                    unit:'',
                    flavor:{
                        text:'',
                        href:''
                    },
                    marque:{
                        text:'',
                        href:''
                    }
                };
                var spans = $(element).find("span").toArray();            
                
                ingredient.quantity = $(spans[0]).data('original');
                ingredient.unit = $(spans[1]).data('original');

                ingredient.flavor.text = $(spans[2]).find('a').first().text();
                ingredient.flavor.href = $(spans[2]).find('a').first().attr("href");
                
                ingredient.marque.text = $(spans[3]).find('a').first().text();       
                ingredient.marque.href = $(spans[3]).find('a').first().attr("href");
                
                array.push(ingredient);
            });
        }
        
        pushIngredient('.wpurp-recipe-ingredient-group-container-arome-s ul.wpurp-recipe-ingredient-container li'
        , result.ingredients);

         pushIngredient('.wpurp-recipe-ingredient-group-container-aromes ul.wpurp-recipe-ingredient-container li'
        , result.ingredients);

        pushIngredient('.wpurp-recipe-ingredient-group-container-additif-s ul.wpurp-recipe-ingredient-container li'
        , result.aditives);

         pushIngredient('.wpurp-recipe-ingredient-group-container-additifs ul.wpurp-recipe-ingredient-container li'
        , result.aditives);

        pushIngredient('.wpurp-recipe-ingredient-group-container-base-a-ajouter ul.wpurp-recipe-ingredient-container li'
        , result.bases);


        return done(null, result);

    })
}