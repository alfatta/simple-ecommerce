const bodyParser = require('body-parser')
const cors = require('cors')
const env = require('dotenv')
const express = require('express')
const mysql = require('mysql')

env.config()

const app = express()
const port = process.env.PORT || 3000
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ecommerce'
})

db.connect((err) => {
  if (err) throw new err
  console.log('DB Connected');
})

app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  req.db = db
  console.log(`${req.method} ${req.originalUrl}`);
})

app.listen(port, () => {
  console.log(`App started on port ${port}`);
})
