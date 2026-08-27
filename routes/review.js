const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js"); 
const reviewController = require("../controllers/reviews.js");

// Reviews - POST Review Route
router.post(
    "/",
    isLoggedIn, 
    validateReview,
    wrapAsync(reviewController.createReview)
);

// Reviews - DELETE Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Successfully deleted a review");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;