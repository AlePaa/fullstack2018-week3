const mongoose = require('mongoose')

const url = 'mongodb://dev:salainen@ds213118.mlab.com:13118/fullstack2018'
mongoose.connect(url)
mongoose.Promise = global.Promise

const Person = mongoose.model('Person', {
  name: String,
  number: String
})

if (process.argv[2] === undefined || process.argv[3] === undefined) {
  Person
    .find({})
    .then(persons => {
      console.log('puhelinluettelo:')
      persons.map(person => console.log(person.name+' '+person.number))
      mongoose.connection.close()
    })
}
else {

  const person = new Person({
    name: process.argv[2],
    number: process.argv[3]
  })

  console.log('lisätään henkilö '+process.argv[2]+
    ' numero '+process.argv[3]+' luetteloon')

  person
    .save()
    .then(mongoose.connection.close())
    .catch(err =>
      console.log(err)
    )
}
