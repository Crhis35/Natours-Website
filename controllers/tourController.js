const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
// upload.single('image')
// upload.array('images', 5);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  //console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  //console.log(req.body.images);
  next();
});
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // //console.log(req.requesTime);
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     // time: req.requesTime,
//     data: {
//       //tours: tours
//       tours,
//     },
//   });
//   // try {
//   //   //console.log(req.query);
//   // BUILD QUERY
//   // 1) Filtiring
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach(el => delete queryObj[el]);

//   // // 2) Advance Filtring
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//   // //console.log(queryStr);

//   // // {dificulty:"easy",duration:{$gte:5}}
//   // // { page: '2', duration: { gte: '5' } }
//   // //gte, gt, lte, lt

//   // let query = Tour.find(JSON.parse(queryStr));

//   // 3) Sorting
//   // sort=price menor a mayor
//   // sort=-price mayor a menor
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   // separa un array y luego se unen con espacios
//   //   query = query.sort(sortBy);
//   //   // sort('price raitings')
//   // } else {
//   //   query = query.sort('-createAt');
//   // }
//   // 4) Field limitin
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v'); //Excluding this field
//   // }
//   // 4) pagination
//   // page=2&limit=10,( 1-10, page 1), (11-20, page 2)
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTour = await Tour.countDocuments();
//   //   if (skip >= numTour) throw new Error('This page doenst exist');
//   // }
//   // const query =  Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   // Execute query
//   // const features = new APIFeatures(Tour.find(), req.query)
//   //   .filter()
//   //   .sort()
//   //   .limitFields()
//   //   .paginate();
//   // const tours = await features.query;

//   // res.status(200).json({
//   //   status: 'success',
//   //   result: tours.length,
//   //   // time: req.requesTime,
//   //   data: {
//   //     //tours: tours
//   //     tours
//   //   }
//   // });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'Fail',
//   //     message: 'Invalid'
//   //   });
//   // }
// });
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   //Populate manda al usuario basado en el id
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // tour.find({_id: req.params.id})

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       //tour: tour
//       tour,
//     },
//   });
//   // try {
//   // const tour = await Tour.findById(req.params.id);
//   // // tour.find({_id: req.params.id})

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     //tour: tour
//   //     tour
//   //   }
//   // });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'Fail',
//   //     message: 'Invalid'
//   //   });
//   // }
//   // //console.log(req.params);
//   // const id = req.params.id * 1;
//   // const tour = tours.find(el => el.id === id);

//   // //   if (id > tours.length) {
//   // });
// });
exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   //   //console.log(req.body);
//   // const newTour = new Tour({});
//   // newTour.save();
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'succes',
//     data: {
//       tour: newTour,
//     },
//   });
//   // try {
//   //   const newTour = await Tour.create(req.body);
//   //   res.status(201).json({
//   //     status: 'succes',
//   //     data: {
//   //       tour: newTour
//   //     }
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'Fail',
//   //     message: 'Invalid data sent!'
//   //   });
//   // }
// });
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'succes',
//     data: {
//       tour,
//     },
//   });
//   // try {
//   // const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//   //   new: true,
//   //   runValidators: true
//   // });
//   // res.status(200).json({
//   //   status: 'succes',
//   //   data: {
//   //     tour
//   //   }
//   // });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'Fail',
//   //     message: 'Invalid data sent!'
//   //   });
//   // }
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'succes',
//     data: null,
//   });
//   // try {
//   // await Tour.findByIdAndDelete(req.params.id);
//   // res.status(204).json({
//   //   status: 'succes',
//   //   data: null
//   // });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'Fail',
//   //     message: 'Invalid data sent!'
//   //   });
//   // }
// });
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $gte: 4.5 } }
  //     },
  //     {
  //       $group: {
  //         _id: { $toUpper: '$difficulty' },
  //         numTours: { $sum: 1 },
  //         numRatings: { $sum: '$ratingsQuantity' },
  //         avgRating: { $avg: '$ratingsAverage' },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' }
  //       }
  //     },
  //     {
  //       $sort: { avgPrice: 1 }
  //     }
  //     // {
  //     //   $match: { _id: { $ne: 'EASY' } }
  //     // }
  //   ]);

  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       stats
  //     }
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: err
  //   });
  // }
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  // try {
  //   const year = req.params.year * 1;
  //   const plan = await Tour.aggregate([
  //     {
  //       $unwind: '$startDates'
  //     },
  //     {
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`)
  //         }
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: { $month: '$startDates' },
  //         numTourStarts: { $sum: 1 },
  //         tours: { $push: '$name' }
  //       }
  //     },
  //     {
  //       $addFields: { month: '$_id' }
  //     },
  //     {
  //       $project: {
  //         _id: 0
  //       }
  //     },
  //     {
  //       $sort: { numTourStarts: -1 }
  //     },
  //     {
  //       $limit: 12
  //     }
  //   ]);
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       plan
  //     }
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: err
  //   });
  // }
});
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, lating, unit } = req.params;
  const [lat, lng] = lating.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(
      new AppError(
        'Please provide latitur and longitude in the format lat,lng',
        400
      )
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'succes',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    next(
      new AppError(
        'Please provide latitur and longitude in the format lat,lng',
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'succes',
    data: {
      data: distances,
    },
  });
});
