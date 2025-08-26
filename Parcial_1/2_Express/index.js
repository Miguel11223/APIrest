const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req, res) => {
    res.send('Post Hello World!')
  })

app.listen(port, () => {
  console.log(`El puerto es  ${port}`)
})