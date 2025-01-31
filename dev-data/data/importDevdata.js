const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './../../config.env' });

const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    // .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log('DB CONECTION SUCCESFULL');
  });

//Read JSON file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//Import Data into DB

const importData = async () => {
  try {
    await Tour.create(tours);
    // skip validation
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    //console.log('Data Succsesffully loaded');
  } catch (err) {
    //console.log(err);
  }
};

// Delete DATA from COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    //console.log('Data Succsesffully deleted');
  } catch (err) {
    //console.log(err);
  }
};
// node ./importDevdata.js --import or --delete
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
//console.log(process.argv);
