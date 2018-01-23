const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('personsbackend/public'))

app.use(bodyParser.json())

app.use(cors())

morgan.token('reqData', function (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.reqData(req,res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))

app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(persons =>
      persons.map(Person.format)
    )
    .then(formattedPersons =>
      res.json(formattedPersons)
    )
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

app.get('/info', (req, res) => {
  Person
    .count({})
    .then(count => {
      const date = Date()
      res.send('<p>puhelinluettelossa '+count+' henkilön tiedot</p>' +
        '<p>'+date+'</p>')
    })
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

app.get('/api/persons/:id', (req, res) => {
  console.log(req.params.id)
  Person
    .findById(req.params.id)
    .then(person => {
      if (person) {
        return Person.format(person)
      } else {
        res.status(404).end()
      }
    })
    .then(formattedPerson => {
      res.json(formattedPerson)
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformed id' })
    })
})

/*
const generateId = () => {
  const maxId = persons.length > 0 ?
    persons.map(n => n.id).sort().reverse()[0] : 1
  return maxId + 1
}
*/

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (body.number === ''||body.name === '') {
    res.status(400).send({ error: 'error: no name or number' })
  } else {
    const person = new Person({
      name: body.name,
      number: body.number
    })

    Person
      .find({ name: person.name })
      .then(result => {
        if (result.length > 0) {
          res.status(400).send({ error: 'error: name already exists' })
        } else {
          person
            .save()
            .then(Person.format)
            .then(savedFormattedPerson =>
              res.json(savedFormattedPerson)
            )
            .catch(error => {
              console.log(error)
              res.status(404).end()
            })
        }
      })
  }
})

app.put('/api/persons/:id', (req, res) => {
  Person.findOneAndUpdate({ _id:req.params.id }, req.body)
    .then(Person.format)
    .then( formattedPerson =>
      res.json(formattedPerson)
    )
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformed id' })
    })
})

app.delete('/api/persons/:id', (req, res) => {
  Person
    .remove({ _id: req.params.id })
    .then(() =>
      res.status(204).end()
    )
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformed id' })
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
