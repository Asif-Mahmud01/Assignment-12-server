// const appointmentOptionsCollection = client.db('doctorsPortal').collection('appointmentOptions')
//         const bookingsCollection = client.db('doctorsPortal').collection('bookings')
//         const usersCollection = client.db('doctorsPortal').collection('users')
//         const doctorsCollection = client.db('doctorsPortal').collection('doctors')
//         const paymentssCollection = client.db('doctorsPortal').collection('payments')

//         //added on database

//         const categories = client.db('doctorsPortal').collection('categories')
//         const Horror = client.db('doctorsPortal').collection('Horror')
//         const Thriller = client.db('doctorsPortal').collection('Thriller')
//         const Comedy = client.db('doctorsPortal').collection('Comedy')

// ////////////////////////////////////////////

//         app.get('/categories', async (req, res) => {
//             const query = {}
//             const cursor = categories.find(query)
//             const users = await cursor.toArray()
//             res.send(users)
//         })

//         app.get('/categories/Horror', async (req, res) => {
//             const query = {}
//             const cursor = Horror.find(query)
//             const users = await cursor.toArray()
//             res.send(users)
//         })
//         app.get('/categories/Thriller', async (req, res) => {
//             const query = {}
//             const cursor = Thriller.find(query)
//             const users = await cursor.toArray()
//             res.send(users)
//         })
//         app.get('/categories/Comedy', async (req, res) => {
//             const query = {}
//             const cursor = Comedy.find(query)
//             const users = await cursor.toArray()
//             res.send(users)
//         })
// // Write to Niaz Rahman
