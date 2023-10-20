const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())


app.get('/', (req, res)=>{
  res.send('Server is Running')
})
app.listen(port, ()=>{
  console.log(`Server port: ${port}`);
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hif0lwq.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db('productDB').collection('product')
    const brandCollection = client.db('productDB').collection('brand')
    const userCollection = client.db('productDB').collection('user')

    app.get('/brand', async(req, res)=>{
      const cursor = brandCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/product/:brand', async(req, res)=>{
    const brandName = req.params.brand
    const products = await productCollection.find({brandName}).toArray()
    res.send(products)
    })
    app.get('/product/:brand/:id', async(req, res)=>{
      const id = req.params.id
      console.log(id);
      const query = {_id : new ObjectId(id)}
      const result= await productCollection.findOne(query)
      res.send(result) 
    })

    app.get('/product', async(req, res)=>{
      const cursor = productCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/product', async(req, res)=>{
      const newProduct = req.body
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct)
      res.send(result)
  })

  app.post('/user', async(req, res)=>{
    const newUser = req.body
    console.log(newUser)
    const result = await userCollection.insertOne(newUser)
    res.send(result)
  })

  app.put('/product/:brand/:id', async(req, res)=>{
    const id = req.params.id
    const options = {upsert: true}
    const updatedProduct = req.body
    const product = {
      $set:{
        name: updatedProduct.name,
        rating: updatedProduct.rating,
        brandName: updatedProduct.brandName,
        price: updatedProduct.price,
        type: updatedProduct.type,
        description: updatedProduct.description,
        image: updatedProduct.image
      }
    }
    
      
    const filter = { _id: new ObjectId(id)}
    const result = await productCollection.updateOne(filter, product, options)
    res.send(result)
  })

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
