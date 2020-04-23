const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, {
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
})
