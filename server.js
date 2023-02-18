require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
// app.use('/', express.static(path.join(__dirname, '/public')));

// routes
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use(verifyJWT);
app.use('/users', require('./routes/api/users'));
app.use('/room', require('./routes/api/rooms'));
app.use('/student', require('./routes/api/students'));
app.use('/reservation', require('./routes/api/reservations'))

// app.all('*', (req, res) => {
//     res.status(404);
//     // if (req.accepts('html')) {
//     //     res.sendFile(path.join(__dirname, 'views', '404.html'));
//     // } else if (req.accepts('json')) {
//     //     res.json({ "error": "404 Not Found" });
//     // } else {
//     //     res.type('txt').send("404 Not Found");
//     // }
// });


// app.use(function (err, req, res, next) {
//     console.error(err.stack)
//     res.status(404).render('"404.ejs"')
//   });

app.get('*', function(req, res){
    res.send('ERR 404', 404);
  });


mongoose.connection.once('open', () => {
    console.log('jestem polaczony');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
