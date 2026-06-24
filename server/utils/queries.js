const Mongoose = require('mongoose');

exports.getStoreProductsQuery = (min, max, rating) => {
  const matchQuery = {
    isActive: true
  };

  const parsedMin = Number(min);
  const parsedMax = Number(max);
  if (!isNaN(parsedMin) && !isNaN(parsedMax) && min !== undefined && max !== undefined) {
    matchQuery.price = { $gte: parsedMin, $lte: parsedMax };
  }

  const parsedRating = Number(rating);
  if (!isNaN(parsedRating) && parsedRating > 0) {
    matchQuery.averageRating = { $gte: parsedRating };
  }

  const basicQuery = [
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brands'
      }
    },
    {
      $unwind: {
        path: '$brands',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        'brand.name': '$brands.name',
        'brand._id': '$brands._id',
        'brand.isActive': '$brands.isActive'
      }
    },
    {
      $match: {
        'brand.isActive': true
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        totalRatings: { $sum: '$reviews.rating' },
        totalReviews: { $size: '$reviews' }
      }
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $eq: ['$totalReviews', 0] },
            0,
            { $divide: ['$totalRatings', '$totalReviews'] }
          ]
        }
      }
    },
    {
      $match: matchQuery
    },
    {
      $project: {
        brands: 0,
        reviews: 0
      }
    }
  ];

  return basicQuery;
};

exports.getStoreProductsWishListQuery = userId => {
  const wishListQuery = [
    {
      $lookup: {
        from: 'wishlists',
        let: { product: '$_id' },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ['$$product', '$product'] } },
                { user: new Mongoose.Types.ObjectId(userId) }
              ]
            }
          }
        ],
        as: 'isLiked'
      }
    },
    {
      $addFields: {
        isLiked: { $arrayElemAt: ['$isLiked.isLiked', 0] }
      }
    }
  ];

  return wishListQuery;
};
