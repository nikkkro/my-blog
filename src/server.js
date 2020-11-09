import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

/*
const articlesInfo = {
    'learn-react': {
        upvotes: 0,
        comments: [],
    },
    'learn-node': {
        upvotes: 0,
        comments: [],
    },
    'my-thoughts-on-resumes': {
        upvotes: 0,
        comments: [],
    },
};
*/

const port = 8002;

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try {
        //const articleName = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('my-blog');

        //const articleInfo = await db.collection('articles').findOne({ name: articleName });

        //res.status(200).json(articleInfo);

        await operations(db);

        client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db: ', error});
    }
};

//app.get('/hello', (req,res) => res.send('Hello!'));
//app.get('/hello/:name', (req,res) => res.send(`Hello ${req.params.name}!`));
//app.post('/hello', (req,res) => res.send(`Hello ${req.body.name}!`));

app.get('/api/articles/:name', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(articleInfo);
    }, res);
    ////try {
        //const articleName = req.params.name;

        ////const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        ////const db = client.db('my-blog');

        //const articleInfo = await db.collection('articles').findOne({ name: articleName });

        //res.status(200).json(articleInfo);

        ////client.close();
    ////} catch (error) {
        ////res.status(500).json({ message: 'Error connecting to db: ', error});
    ////}
});

app.post('/api/articles/:name/upvote', async (req,res) => {
    withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                upvotes: articleInfo.upvotes + 1,
            },
        });

        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);
    
    /*
    try {
        const articleName = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('my-blog');

        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                upvotes: articleInfo.upvotes + 1,
            },
        });

        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);

        client.close();

    //articlesInfo[articleName].upvotes += 1; 
    //res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes!!`);
    } catch {
        res.status(500).json({ message: 'Error connecting to db: ', error});
    }
    */
    
});

app.post('/api/articles/:name/add-comment', (req,res) => {
    withDB(async (db) => {
        const { username, text } = req.body;
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                comments: articleInfo.comments.concat({ username, text }),
            },
        });

        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);
    
    //const { username, text } = req.body;
    //const articleName = req.params.name;

    //articlesInfo[articleName].comments.push({ username, text });

    //res.status(200).send(articlesInfo[articleName]);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}...`));