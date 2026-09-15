const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const hostController = require("../controllers/host.js");

router.get("/", isLoggedIn, wrapAsync(hostController.index));
router.delete("/bookings/:bookingId", isLoggedIn, wrapAsync(hostController.cancelBooking));

module.exports = router;
