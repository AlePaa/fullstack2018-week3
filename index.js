const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

let persons = require('./db')

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const date = Date()
  const count = persons.length
  res.send('<p>puhelinluettelossa '+count+' henkilön tiedot</p>' +
    '<p>'+date+'</p>')
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if ( person ) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

const generateId = () => {
  const maxId = persons.length > 0 ?
    persons.map(n => n.id).sort().reverse()[0] : 1
  return maxId + 1
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({error: 'name or number missing'})
  }
  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({error: 'name already has a number'})
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person)

  res.json(persons)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
