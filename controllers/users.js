const User = require ("../models/user");
module.exports.RenderSignupForm =(req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res, next) => { 
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect(req.session.redirectUrl || "/listings"); // added fallback
        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm =(req, res) => {
    res.render("users/login.ejs");
};


module.exports.login = (req, res) => { // wrapped in arrow function
        req.flash("success", "Welcome back to Wanderlust!");
        res.redirect(res.locals.redirectUrl || "/listings"); // added fallback
    }

module.exports.logout =(req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        let redirectUrl =res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    });
}

module.exports.renderContactForm = (req, res) => {
    res.render("contact.ejs");
};

module.exports.submitContactForm = (req, res) => {
    req.flash("success", "Thank you for contacting us! We will get back to you soon.");
    res.redirect("/listings");
};