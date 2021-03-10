const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');

//Settings =============================================================================
app.set('view engine', 'ejs');
mongoose.connect('mongodb://127.0.0.1/API', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(){
    console.log("DB Connected")
})

//Mongoose Schemas =====================================================================
const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
});

const Article = mongoose.model('Article', articleSchema);

//Mongoose Functions ===================================================================
const createArticle = function(title, content){
    const article = new Article({
        title: title,
        content: content
    });

    article.save((err, data)=>{
        if(err){
            console.warn(err);
        };
    });
};

//Get Requests =========================================================================
app.get('/', (req, res)=>{
    res.render("index.ejs");
});


//Server Out ===========================================================================
app.listen(3000, ()=>{
    console.log("listening on 3000")
});