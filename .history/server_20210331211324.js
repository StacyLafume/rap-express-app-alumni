// requiring express module
const express = require('express')
// assigning the express module object to app
const app = express()
// assigning MongoClient to mongodb MongoClient which is a module
const MongoClient = require('mongodb').MongoClient
// assigning PORT  2121
const PORT = 2121
// reuiring dot env to env variables
require('dotenv').config()

// db is global variable 
let db,
    // getting connection string from env file 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'rap'

// connecting to the data base and uses a promise
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })

// MIDDEL WIRE

// This tells Express we’re using EJS as the template engine.
app.set('view engine', 'ejs')

// tells express to render the public folder
app.use(express.static('public'))

// does what body parser did 
app.use(express.urlencoded({ extended: true }))

// send response as json format
app.use(express.json())


app.get('/', (request, response) => {
    // access rappers collection sorts form descending order
    db.collection('rappers').find().sort({ likes: -1 }).toArray()
        .then(data => {
            // rendering data from data base to ejs
            response.render('index.ejs', { info: data })
        })
        .catch(error => console.error(error))
})

// inserting the data that comes from the form 
app.post('/addRapper', (request, response) => {

    db.collection('rappers').insertOne({
        stageName: request.body.stageName,
        birthName: request.body.birthName, likes: 0
    })
        .then(result => {
            console.log('Rapper Added')
            response.redirect('/')
        })
        .catch(error => console.error(error))
})

app.put('/addOneLike', (request, response) => {
    db.collection('rappers').updateOne({ stageName: request.body.stageNameS, birthName: request.body.birthNameS, likes: request.body.likesS }, {
        $set: {
            likes: request.body.likesS + 1
        }
    }, {
        sort: { _id: -1 },
        upsert: true
    })
        .then(result => {
            console.log('Added One Like')
            // sends 'Like Added' to client
            response.json('Like Added')
        })
        .catch(error => console.error(error))

})

app.delete('/deleteRapper', (request, response) => {
    db.collection('rappers').deleteOne({ stageName: request.body.stageNameS })
        .then(result => {
            console.log('Rapper Deleted')
            response.json('Rapper Deleted')
        })
        .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})