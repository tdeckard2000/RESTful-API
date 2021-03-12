const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//Settings =============================================================================
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost:27017/API', {useNewUrlParser: true, useUnifiedTopology: true})
.catch((err)=>{console.log(err)});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(){
    // console.log("DB Connected")
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

    article.save((err, results)=>{
        if(err){
            console.warn(err);
        };
    });
};

const getAllArticles = function(){
    return new Promise((resolve, reject)=>{
        Article.find({},(err, results)=>{
            if(err){
                console.warn(err)
                reject(err);
            };
            resolve(results);
        });
    })
};

const deleteOneArticle = function(articleTitle){
    return new Promise((resolve, reject)=>{
        Article.deleteOne({title:articleTitle}, (err, results)=>{
            if(err){
                console.warn(err);
                reject(err);
            }else{
                resolve(results);
            };
        });
    })
};

const getOneArticle = function(articleTitle){
    return new Promise((resolve, reject)=>{
        Article.findOne({title: articleTitle}, (err, results)=>{
            if(err){
                reject(err);
            }else{
                resolve(results);
            };
        });
    });
};

const updateArticleContent = function(articleTitle, newTitle, newContent){
    return new Promise((resolve, reject)=>{
        Article.updateOne({title:articleTitle}, {title: newTitle, content: newContent}, (err, results)=>{
            if(err){
                console.warn(err);
                reject(err);
            }else{
                resolve(results);
            };
        });
    });
};

const patchArticleContent = function(title, newTitle, newContent){

    if(newTitle === null || newTitle === ""){
        //prevents field from becoming null or blank
        //omitUndefined option catches undefined
        title = undefined;
    };

    return new Promise((resolve, reject)=>{
        Article.updateOne({title: title}, {content: newContent, title: newTitle}, {omitUndefined:true}, (err, results)=>{
            if(err){
                reject(err);
            }else{
                resolve(results);
            };
        });
    });
};

//Get Requests =========================================================================
app.get('/articles', async (req, res)=>{
    try {
        const allArticles = await getAllArticles();
        res.send(allArticles);
    } catch(err) {
        res.send("Error");
    };
    // res.render("allArticles.ejs", {allArticles:allArticles});
});

app.get('/articles/:title', async (req, res)=>{
    const title = req.params.title;

    try {
        const result = await getOneArticle(title);

        if(result){
            res.send(result);
        }else{
            res.send("No articles found with that title.")
        };
    } catch(err){
        res.send(err);
    };
});

//Post Requests ========================================================================
app.post('/articles', (req, res)=>{
    const title = req.body.title;
    const content = req.body.content;
    createArticle(title, content);
    res.send("Created " + title + " article.");
});

//Put Requests =========================================================================
app.put('/articles/:title', async(req, res)=>{
    const title = req.params.title;
    const newTitle = req.body.title;
    const newContent = req.body.content;

    if(!newTitle){
        res.send("Cannot replace title with an empty title.");
        return;
    };

    try{
        const result = await updateArticleContent(title, newTitle, newContent);
        const articleFound = result.n;
        const articleUpdated = result.nModified;

        if(articleFound && articleUpdated){
            res.send(title + " article was found and updated.")

        }else if(articleFound && !articleUpdated){
            res.send("Article was found, but no changes were made because\
            the content and title were the same.");
        }else{
            res.send("The article " + title + " was not found, so could not be updated.");
        };

    }catch(err){
        res.send(err);
    };
});

//Patch Requests =======================================================================
app.patch('/articles/:title', async(req, res)=>{
    const title = req.params.title;
    const newTitle = req.body.title;
    const newContent = req.body.content;

    if(!newTitle && !newContent){
        res.send('No new title or content was provided.');
        return;
    };

    try {
        const result = await patchArticleContent(title, newTitle, newContent);
        res.send("done")
    } catch(err){
        res.send(err);
    }

});


//Delete Requests ======================================================================
app.delete('/articles/:title', async(req, res)=>{
    const title = req.params.title;
    console.log(req.params)
    try {
        const result = await deleteOneArticle(title);
        const numDeleted = result.deletedCount;

        if(numDeleted > 0){
            res.send("Deleted " + title + ".");
        }else{
            res.send("No articles deleted.")
        };

    } catch(err){
        res.send("Error: " + err);
    };
});


//Server Out ===========================================================================
app.listen(3000, ()=>{
    console.log("listening on 3000")
});