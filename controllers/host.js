const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id }).populate("reviews");
    const listingIds = listings.map((l) => l._id);

    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user")
        .sort({ checkIn: -1 });

    const totalListings = listings.length;
    const now = new Date();

    const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
    const totalBookingsCount = bookings.length;

    const upcomingBookings = bookings.filter((b) => b.status === "confirmed" && new Date(b.checkOut) >= now);
    const completedBookings = bookings.filter((b) => b.status === "confirmed" && new Date(b.checkOut) < now);
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    let totalReviewsCount = 0;
    let totalRatingSum = 0;

    const listingStats = listings.map((listing) => {
        const lReviews = listing.reviews || [];
        const lRevCount = lReviews.length;
        const lRatingSum = lReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const lAvgRating = lRevCount > 0 ? (lRatingSum / lRevCount).toFixed(1) : "N/A";

        totalReviewsCount += lRevCount;
        totalRatingSum += lRatingSum;

        const lBookings = bookings.filter((b) => b.listing && b.listing._id.equals(listing._id));
        const lConfirmed = lBookings.filter((b) => b.status === "confirmed");
        const lRevenue = lConfirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        return {
            ...listing.toObject(),
            avgRating: lAvgRating,
            reviewCount: lRevCount,
            bookingCount: lBookings.length,
            revenue: lRevenue,
        };
    });

    const overallAvgRating = totalReviewsCount > 0 ? (totalRatingSum / totalReviewsCount).toFixed(1) : "N/A";

    res.render("host/dashboard.ejs", {
        listings: listingStats,
        bookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        totalListings,
        totalBookingsCount,
        totalRevenue,
        overallAvgRating,
        totalReviewsCount,
    });
};

module.exports.cancelBooking = async (req, res, next) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/dashboard");
    }

    if (!booking.listing || !booking.listing.owner || !booking.listing.owner.equals(req.user._id)) {
        return next(new ExpressError(403, "You do not have permission to cancel this booking!"));
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Guest booking cancelled successfully.");
    res.redirect("/dashboard");
};
