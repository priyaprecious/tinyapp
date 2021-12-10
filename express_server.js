const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

//---------------Express app uses EJS as it template engine-----------------
app.set("view engine", "ejs");

const bodyParser = require("body-parser");

//----------------- Importing helper functions------------------------
const { authenticateUserInfo, emailLookUp, getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ['tinyapp'],
    maxAge: 24 * 60 * 60 * 1000
}));

//------------------database for urls---------------
const urlDatabase = {};

//----------------- database for users--------------
const users = {};

//------------- will redirect to login page if user not logged in, if user logged in then will redirect to homepage-------------------
app.get("/", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        return res.redirect("/urls");
    }
    res.render("login", { users: user });
});

//------------------ urls page----------------------
app.get("/urls", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        const templateVars = {
            urls: urlsForUser(user, urlDatabase),
            users: user
        };
        res.render("urls_index", templateVars);
    } else {
        res.status(400).send("Please <a href='/login'> Login</a> or <a href='/register'> Register</a> to create/view tiny urls")
    }
});

//-------------------user registration page----------------------
app.get("/register", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        return res.redirect("/urls");
    }

    res.render("register", { users: user });
})

//------------------user will get registered-----------------------
app.post("/register", (req, res) => {
    const { email, password } = req.body;
    const { error } = authenticateUserInfo(email, password, users);
    if (error) {
        res
            .status(400)
            .send(`${error} <br/>Please try again  <a href="/register"> Register </a>`)
    } else {
        const randomUserId = generateRandomString();
        req.session.user_id = randomUserId;
        const hashPassword = bcrypt.hashSync(password, 10);
        users[randomUserId] =
        {
            "id": randomUserId,
            "email": email,
            "password": hashPassword
        };
        res.redirect("/urls");
    }

})

//----------------user login page-------------------
app.get("/login", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        return res.redirect("/urls");
    }
    return res.render("login", { users: user });
})

//-----------------user will be logged in if email and password is valid---------------
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const { error } = emailLookUp(email, users);
    if (!error) {
        res
            .status(403)
            .send(`Invalid User Please try again <a href ='/login'> Login </a>`);
    } else {
        const user = getUserByEmail(email, users);
        if (!bcrypt.compareSync(password, user.password)) {
            res.status(403).send("Invalid password Please try again <a href ='/login'> Login </a>")
        }
        req.session.user_id = user["id"];
        res.redirect("/urls");
    }
});

//----------------will be redirect to longURL if shortURL is valid------------------
app.get("/u/:shortURL", (req, res) => {
    if (urlDatabase[req.params.shortURL]) {
        res.redirect(urlDatabase[req.params.shortURL].longURL);
    } else {
        res.status(404).send("Invalid short url");
    }
});

//---------------create new short url-------------------
app.get("/urls/new", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        return res.render("urls_new", { users: user });
    }
    res.redirect("/login");
});

//-------------------user cannot create short url without login----------------
app.post("/urls/new", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        return res.render("urls_new", { users: user });
    }
    res.status(405).send("Not Allowed to create a new URL without Login <br/><a href ='/login'> Login here</a>");
});

//--------------------In the main page list of short urls and corresponding long urls are displayed--------------------
app.get("/urls/:shortURL", (req, res) => {
    if (users[req.session.user_id]) {
        if (urlDatabase[req.params.shortURL]) {
            const templateVars =
            {
                shortURL: req.params.shortURL,
                longURL: urlDatabase[req.params.shortURL].longURL,
                users: users[req.session.user_id]
            };
            res.render("urls_show", templateVars);
        } else {
            res
                .status(405)
                .send("Short URL does not exist.Please check and try again <br/><a href='/urls'> Main page </a>")
        }
    }
    res
        .status(405)
        .send("Please <a href='/login'> Login </a> to proceed further ")
});

//------------------------short urls are created for the corresponding user-------------------
app.post("/urls", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        const newShortUrl = generateRandomString();
        const longNewURL = req.body.longURL;
        urlDatabase[newShortUrl] = {
            longURL: longNewURL,
            userID: user["id"]
        };
        res.redirect(`/urls/${newShortUrl}`);
    }
    res.status(405).send("Not Authorized to create a new URL without Login <br/><a href ='/login'> Login here</a>");
});

//----------------------delete short url-----------------------------
app.post("/urls/:shortURL/delete", (req, res) => {
    const user = users[req.session.user_id];
    if (user) {
        userURL = urlsForUser(user, urlDatabase);
        console.log(userURL);
        if (Object.keys(userURL).includes(req.params.shortURL)) {
            const shortURL = req.params.shortURL;
            delete urlDatabase[shortURL];
            res.redirect("/urls");
        } else {
            res.status(401).send("Not Authorized to delete this shortURL");
        }
    }
    res
        .status(401)
        .send("Not allowed to delete without login <br/><a href='/login'> Login here</a>")
})

//---------------------update short urls with new longURL----------------------------
app.post("/urls/:shortURL", (req, res) => {
    if (users[req.session.user_id]) {
        if (urlDatabase[req.params.shortURL]) {

            const shortURL = req.params.shortURL;
            urlDatabase[shortURL] = {
                longURL: req.body.longURL,
                userID: req.session.user_id
            };
            res.redirect("/urls");
        } else {
            res
                .status(405)
                .send("Access Denied. Please check the short url and try again <br/><a href='/urls'> Main page </a>")
        }
    }
    res
        .status(405)
        .send("Please <br/><a href='/login'> Login </a> or <a href='/register'> Register </a> first")
})

//------------------user will be logged out and redirected to login page--------------------
app.post("/logout", (req, res) => {
    req.session = null; //cookie-session is deleted
    res.redirect('/login');
})


//-------------------tinyapp will run on the configured port number
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});