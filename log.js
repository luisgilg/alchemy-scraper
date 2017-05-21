const winston = require('winston')
winston.level = 'debug'  
var app = {
    info:function(msg, ...meta){
        winston.log('info',msg, meta)
    },
    error:function(msg, ...meta){
        winston.log('error',msg, meta)
    },
    warn:function(msg, ...meta){
        winston.log('warn',msg, meta)
    },
    verbose:function(msg, ...meta){
        winston.log('verbose',msg, meta)
    },
    debug:function(msg, ...meta){
        winston.log('debug',msg, meta)
    },
    silly:function(msg, ...meta){
        winston.log('silly',msg, meta)
    }
}

exports = module.exports = app;