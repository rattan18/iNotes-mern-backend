const connectToMongo = require('./db');
var cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const app = express();

dotenv.config({
  path: './models/config.env'
})





connectToMongo()








const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

//AVAILABLE ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook app listening at http://localhost:${port}`)
})
