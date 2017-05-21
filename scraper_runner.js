var request = require('request');
var fs = require('fs');
var config = require('./config');

var {data_path} = config;
var {lediy_index_scraper} = config;
var {lediy_recipe_scraper} = config;
var {get_key} = config;


console.log("requesting ... %s", lediy_index_scraper);
request(lediy_index_scraper, function(error, response, html){
    if (error){
        console.log(error);

        return;
    }

    var my_index = JSON.parse(html);
    console.log(html);

    return collect_data(my_index, 0);

});

function collect_data(array, index){
    console.log(index +" of " + array.length);

    if(index >= array.length){
        console.log("FINISHED " + index +" of " + array.length);        
        return;
    }
    
    var value = array[index];
    var url = value.href;
    var id = get_key(url);
    
    var file_path = data_path + "\\" + id + ".json"; 

    fs.exists(file_path, (exists)=>{
        if(exists){
            console.log("exist: " + file_path);
            return collect_data(array, ++index);            
        }

        console.log("NOT exist: " + file_path);     

        get_recipe(id, (err, txt)=>{
            if (err){
                console.log(err);  

                 setTimeout(()=>{
                    collect_data(array, ++index);            
                 }, 1000 * Math.floor(Math.random() * 30) + 5);

                return;
            }

            fs.writeFile(file_path, txt, (err)=>{
                if (err){
                    console.log(err);
                }else{
                    console.log("file created: " + file_path);
                }
                
                 setTimeout(()=>{
                    collect_data(array, ++index);            
                }, 1000 * Math.floor(Math.random() * 30) + 5);
            })
        });
    })      

}

function get_recipe(recipe, done){
    var url = lediy_recipe_scraper + "/" + recipe;
    console.log("requesting ... " + url);

    request(url, (error, response, html)=>{
        if (error){
            console.log(error);            
            return done(error,null);
        }

        console.log(html);
        return done(null, html)
    });
}