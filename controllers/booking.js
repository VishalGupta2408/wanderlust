const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
    let { id } = req.params;
    let { checkIn, checkOut } = req.body.booking || {};

    if (!checkIn || !checkOut) {
        req.flash("error", "Please select valid check-in and check-out dates.");
        return res.redirect(`/listings/${id}`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        req.flash("error", "Invalid date format.");
        return res.redirect(`/listings/${id}`);
    }

    if (checkInDate < today) {
        req.flash("error", "Check-in date cannot be in the past.");
        return res.redirect(`/listings/${id}`);
    }

    if (checkOutDate <= checkInDate) {
        req.flash("error", "Check-out date must be after check-in date.");
        return res.redirect(`/listings/${id}`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    const overlappingBooking = await Booking.findOne({
        listing: id,
        status: "confirmed",
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
    });

    if (overlappingBooking) {
        req.flash("error", "Selected dates overlap with an existing booking.");
        return res.redirect(`/listings/${id}`);
    }

    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        totalPrice,
        status: "confirmed",
    });

    await newBooking.save();
    req.flash("success", "Booking confirmed! Have a great trip!");
    res.redirect("/bookings");
};

module.exports.index = async (req, res) => {
    const userBookings = await Booking.find({ user: req.user._id })
        .populate({
            path: "listing",
            populate: { path: "owner" }
        })
        .sort({ checkIn: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookings = userBookings.filter(b => new Date(b.checkOut) >= today && b.status === "confirmed");
    const pastOrCancelledBookings = userBookings.filter(b => new Date(b.checkOut) < today || b.status === "cancelled");

    res.render("bookings/index.ejs", { upcomingBookings, pastOrCancelledBookings });
};

module.exports.cancelBooking = async (req, res) => {
    let { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You do not have permission to cancel this booking.");
        return res.redirect("/bookings");
    }

    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/bookings");
};