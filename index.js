var dataModel = require("./data-modeler/lediy")

dataModel.transform_all().then((obj)=>{
    console.log(obj)
},(err)=>{
    console.error(err)
})