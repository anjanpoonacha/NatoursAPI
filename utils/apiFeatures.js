class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    /*----------------- 1. BUILD QUERY -----------------*/

    const queryObj = { ...this.queryString };
    const excludeList = ['page', 'sort', 'limit', 'fields'];
    excludeList.forEach(el => delete queryObj[el]);

    //1.2 ADVANCED FILTERING
    // console.log(req.query);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      /* IN MONGOOSE sort('price ratingsAverage') */

      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      // console.log(sortBy);
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 12;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;

// /*----------------- 1. BUILD QUERY -----------------*/

// const queryObj = { ...req.query };
// const excludeList = ['page', 'sort', 'limit', 'fields'];
// excludeList.forEach(el => delete queryObj[el]);

// //1.2 ADVANCED FILTERING
// console.log(req.query);
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
// // console.log(JSON.parse(queryStr));
// let query = Tour.find(JSON.parse(queryStr));

/*----------------- 2. SORTING -----------------*/

// if (req.query.sort) {
//   /* IN MONGOOSE sort('price ratingsAverage') */
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
//   console.log(sortBy);
// } else {
//   query.sort('-createdAt');
// }

/*----------------- 3. PROJECTION OR LIMITING -----------------*/

// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query.select(fields);
// } else {
//   query.select('-__v');
// }

/*----------------- 4. PAGINATION -----------------*/

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 3;
// const skip = (page - 1) * limit;
// query.skip(skip).limit(limit);
// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (numTours <= skip) throw new Error('This message is not available');
// }
