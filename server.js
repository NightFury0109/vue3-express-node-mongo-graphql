const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

const { PORT, MONGO_URI } = process.env;

const port = PORT || 5000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn: function (error) {
    if (!error.originalError) {
      return error;
    }
    return {
      message: error.message,
      data: error.originalError.data || null,
      status: error.originalError.statusCode || 500,
      locations: error.locations,
      path: error.path
    };
  }
}));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  res.status(status).json({ message: error.message, data: error.data || null });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(port, console.log(`Server is running on port: ${port}`));
  })
  .catch(err => console.log(`DB Error: ${err}`));
