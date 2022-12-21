const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require('express');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000

const app = express()

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zbisngo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    console.log('token inside verifyJWT', req.headers.authorization)
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.send(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        console.log(decoded)
        if (error) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()
    })
}

const appointmentOptionsCollection = client.db('doctorsPortal').collection('appointmentOptions')
const bookingsCollection = client.db('doctorsPortal').collection('bookings')
const usersCollection = client.db('doctorsPortal').collection('users')
const doctorsCollection = client.db('doctorsPortal').collection('doctors')
const paymentssCollection = client.db('doctorsPortal').collection('payments')

// new added

const categories = client.db('doctorsPortal').collection('categories')
const Horror = client.db('doctorsPortal').collection('Horror')
const Thriller = client.db('doctorsPortal').collection('Thriller')
const Comedy = client.db('doctorsPortal').collection('Comedy')

const verifyAdmin = async (req, res, next) => {
    console.log('inside verification', req.decoded.email)
    const decodedEmail = req.decoded.email;

    const query = { email: decodedEmail }
    const user = await usersCollection.findOne(query)

    if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next()
}

app.get('/appointmentOptions', async (req, res) => {
    const date = req.query.date;
    const query = {};
    const options = await appointmentOptionsCollection.find(query).toArray();

    // get the bookings of the provided date
    const bookingQuery = { appointmentDate: date }
    const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

    // code carefully :D
    options.forEach(option => {
        const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
        const bookedSlots = optionBooked.map(book => book.slot);
        const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
        option.slots = remainingSlots;
    })
    res.send(options);
});

app.get('/bookings', verifyJWT, async (req, res) => {
    const email = req.query.email;

    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
        // return res.status(403).send({message: 'forbidden access'})
    }

    const query = { email: email }
    const booking = await bookingsCollection.find(query).toArray()
    res.send(booking)
})

app.post('/bookings', async (req, res) => {
    const booking = req.body
    const query = {
        appointmentDate: booking.appointmentDate,
        email: booking.email,
        treatment: booking.treatment
    }

    const alreadyBooked = await bookingsCollection.find(query).toArray()
    if (alreadyBooked.length) {
        const message = `You already have a booking on ${booking.appointmentDate}`
        return res.send({ acknowledge: false, message })
    }

    const result = await bookingsCollection.insertOne(booking)
    res.send(result)

})

app.post('/users', async (req, res) => {
    const user = req.body
    console.log(user)
    const result = await usersCollection.insertOne(user)
    console.log(result)
    res.send(result)
})

app.get('/jwt', async (req, res) => {
    const email = req.query.email
    const query = { email: email }
    const user = await usersCollection.findOne(query)
    if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
        return res.send({ accessToken: token })
    }
    res.status(403).send({ accessToken: '' })
})

app.get('/users', async (req, res) => {
    const query = {};
    const users = await usersCollection.find(query).toArray();
    res.send(users);
})
///////////////////////////
app.delete('/users/:id', async (req, res) => {
    const id = req.params.id
    const filter = { _id: ObjectId(id) }
    const result = await usersCollection.deleteOne(filter)
    console.log(id)
    res.send(result)
})
//////////////////////////        

app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {

    const id = req.params.id;
    const filter = { _id: ObjectId(id) }
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            role: 'admin'
        }
    }
    const result = await usersCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
})

app.get('/users/admin/:id', async (req, res) => {
    const email = req.params.id
    const query = { email }
    const user = await usersCollection.findOne(query)
    res.send({ isAdmin: user?.role === 'admin' })

})

app.get('/appointmentSpeciality', async (req, res) => {
    const query = {}
    const result = await appointmentOptionsCollection.find(query).project({ name: 1 }).toArray()
    res.send(result)
})

app.post('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
    const doctor = req.body
    const result = await doctorsCollection.insertOne(doctor)
    res.send(result)
})

app.get('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
    const query = {}
    const doctor = await doctorsCollection.find(query).toArray()
    res.send(doctor)
})

app.delete('/doctors/:id', verifyJWT, verifyAdmin, async (req, res) => {
    const id = req.params.id
    const filter = { _id: ObjectId(id) }
    const result = await doctorsCollection.deleteOne(filter)
    res.send(result)
})

app.get('/bookings/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: ObjectId(id) }
    const booking = await bookingsCollection.findOne(query)
    res.send(booking)
})

// New added


app.get('/categories', async (req, res) => {
    const query = {}
    const cursor = categories.find(query)
    const users = await cursor.toArray()
    res.send(users)
})

app.get('/categories/Horror', async (req, res) => {
    const query = {}
    const cursor = Horror.find(query)
    const users = await cursor.toArray()
    res.send(users)
})
app.get('/categories/Thriller', async (req, res) => {
    const query = {}
    const cursor = Thriller.find(query)
    const users = await cursor.toArray()
    res.send(users)
})

app.get('/categories/Comedy', async (req, res) => {
    const query = {}
    const cursor = Comedy.find(query)
    const users = await cursor.toArray()
    res.send(users)
})


// New added end
app.post("/create-payment-intent", async (req, res) => {
    const booking = req.body
    const price = booking.price.split('$').join('')
    console.log(price)
    const amount = price * 100
    console.log(amount)
    const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        "payment_method_types": [
            "card"
        ]
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });

    app.post('/payments', async (req, res) => {
        const payment = req.body
        const result = await paymentssCollection.insertOne(payment)
        const id = payment.bookingId
        const filter = { _id: ObjectId(id) }
        const updatedDoc = {
            $set: {
                paid: true,
                transactionId: payment.transactionId
            }
        }
        const updateresult = await bookingsCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })
})



// async function run() {
//     try {
          
//     }
//     finally {

//     }
// }
// run().catch(console.log)

app.get('/', async (req, res) => {
    res.send('doctrs server is running')
})

app.listen(port, () => console.log(`doctors portal is running on ${port}`))