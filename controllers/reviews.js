const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully Created a Review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deletereviews = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    req.flash('success', 'Successfully Deleted a Review!');
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    // res.send('you delete me!');
}