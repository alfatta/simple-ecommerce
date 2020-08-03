const env = require('dotenv')
const express = require('express')

env.config()

const app = express()
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`App started on port ${port}`);
})
