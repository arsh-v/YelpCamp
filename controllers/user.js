const User = require('../models/user')



module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, err => {
            if (err) { return next(err) }
            req.flash('success', 'Welcome to Yelpcamp');
            res.redirect('/campgrounds');
        })

    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
    // console.log(registerdUser);

}

module.exports.renderlogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {

    req.flash('success', 'Welocom Back!!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        req.flash('success', 'Successfully LogOut!');
        res.redirect("/campgrounds");
    });
}