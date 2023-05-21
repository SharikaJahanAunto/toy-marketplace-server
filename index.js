const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a2u17kq.mongodb.net/?retryWrites=true&w=majority`;

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
    
    const toyCollection = client.db('marketPlaceDB').collection('toys')

    app.get('/toys', async(req, res) =>{
        const result = await  toyCollection.find().toArray()
        res.send(result);
        // res.send(result)
    })


    


  
    
      // post operation
      app.post("/toys", async (req, res) => {
        const toys = req.body;
        const result = await toyCollection.insertOne(toys);
        res.json(result);
      });
    

      
      
      // Update toy details
      app.put('/toys/:id', async (req, res) => {
        const { id } = req.params;
        const { toyName, sellerName, sellerEmail, price, rating, quantity, description } = req.body;
        try {
          const updatedToy = await toyCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
              $set: {
                toyName,
                sellerName,
                sellerEmail,
                price,
                rating,
                quantity,
                description,
              },
            },
            { returnOriginal: false }
          );
          if (!updatedToy.value) {
            return res.status(404).json({ error: 'Toy not found' });
          }
          res.json(updatedToy.value);
        } catch (error) {
          console.error('Error updating toy:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      
      // Delete a toy
      app.delete('/toys/:id', async (req, res) => {
        const { id } = req.params;
        try {
          const deletedToy = await toyCollection.findOneAndDelete({ _id: ObjectId(id) });
          if (!deletedToy.value) {
            return res.status(404).json({ error: 'Toy not found' });
          }
          res.json({ message: 'Toy deleted successfully' });
        } catch (error) {
          console.error('Error deleting toy:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) =>{
    res.send('toy marketplace is running')
})

app.listen(port, ()=>{
    console.log(`toy marketplace server is running on port: ${port}`);
})

