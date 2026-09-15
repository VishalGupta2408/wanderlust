const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.createBooking = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing requested does not exist!");
        return res.redirect("/listings");
    }

    let { checkIn, checkOut } = req.body.booking;
    let checkInDate = new Date(checkIn);
    let checkOutDate = new Date(checkOut);
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        req.flash("error", "Invalid check-in or check-out dates!");
        return res.redirect(`/listings/${id}`);
    }

    if (checkInDate < today) {
        req.flash("error", "Check-in date cannot be in the past!");
        return res.redirect(`/listings/${id}`);
    }

    if (checkOutDate <= checkInDate) {
        req.flash("error", "Check-out date must be after check-in date!");
        return res.redirect(`/listings/${id}`);
    }

    const existingBookings = await Booking.find({
        listing: id,
        status: "confirmed",
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
    });

    if (existingBookings.length > 0) {
        req.flash("error", "This listing is already booked for the selected dates!");
        return res.redirect(`/listings/${id}`);
    }

    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalPrice = nights * listing.price;

    const newBooking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        totalPrice,
        status: "confirmed",
    });

    await newBooking.save();
    req.flash("success", "Booking confirmed! Have a wonderful trip!");
    res.redirect("/bookings");
};

module.exports.getUserBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .sort({ checkIn: -1 });

    const now = new Date();
    const upcomingBookings = bookings.filter((b) => new Date(b.checkOut) >= now && b.status === "confirmed");
    const pastBookings = bookings.filter((b) => new Date(b.checkOut) < now || b.status === "cancelled");

    res.render("bookings/index.ejs", { upcomingBookings, pastBookings });
};

module.exports.cancelBooking = async (req, res, next) => {
    let { bookingId } = req.params;
    let booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/bookings");
    }

    let isGuest = booking.user.equals(req.user._id);
    let isHost = booking.listing && booking.listing.owner && booking.listing.owner.equals(req.user._id);

    if (!isGuest && !isHost) {
        return next(new ExpressError(403, "You do not have permission to cancel this booking!"));
    }

    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Trip booking cancelled successfully!");
    res.redirect(req.get("referer") || "/bookings");
};
