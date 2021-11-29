const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');
const crypto = require('crypto');

// const { graphqlHTTP } = require('express-graphql');
const graphqlHTTP = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const auth = require('./middlewares/auth');
const { clearImage } = require('./utils/file');

const app = express();

const { PORT, MONGO_URI } = process.env;

const port = PORT || 5000;

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'client/public/images');
  },
  filename: (req, file, callback) => {
    crypto.randomBytes(10, (error, buffer) => {
      if (error) throw error;
      const parts = file.originalname.split('.');
      const extension = parts[parts.length - 1];
      const filename = buffer.toString('hex') + '.' + extension;
      callback(null, filename);
    });
  }
});

const fileFilter = (req, file, callback) => {
  const allowedExtensions = ['image/jpg', 'image/jpeg', 'image/png'];
  if (allowedExtensions.includes(file.mimetype)) {
    callback(null, true);
  } else {
    return callback(null, false);
  }
};

app.use(bodyParser.json());
app.use('/client/public/images', express.static(path.join(__dirname, 'client/public/images')));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error('Not authenticated');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    return res
      .status(200)
      .json({ message: 'No image provided' });
  }
  if (req.body.oldPath) {
    clearImage('/client/public/' + req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: 'Image stored', filePath: req.file.path });
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
