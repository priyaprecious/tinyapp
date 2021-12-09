const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const { authenticateUserInfo, emailLookUp, getUserByEmail, urlsForUser } = require("./helper");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
};

const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/user.json", (req, res) => {
    res.json(users);
  });

  app.get("/urls", (req, res) => {
    const user = users[req.cookies["user_id"]];
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

  app.get("/register", (req, res) => {
    const user = users[req.cookies["user_id"]];
    if (user) {
      return res.redirect("/urls");
    }

    res.render("register", {users: user});
  })

  app.post("/register", (req, res) => {
    const {email, password} = req.body;
    const {error} = authenticateUserInfo(email, password, users);
    if (error) {
      res
      .status(400)
      .send(`${error} <br/>Please try again  <a href="/register"> Register </a>`)
    } else {
    const randomUserId = generateRandomString();
    res.cookie("user_id", randomUserId);
    users[randomUserId] = 
    {
      "id": randomUserId,
      "email": email,
      "password": password
    };
    res.redirect("/urls");
    }

  })

  app.get("/login", (req, res) => {
    const user = users[req.cookies["user_id"]];
    if (user) {
        return res.redirect("/urls");
    }
    return res.render("login", {users: user});
  })

  app.post("/login", (req, res) => {
    const {email, password} = req.body;
    const {error} = emailLookUp(email, users);
    if (!error) {
      res
      .status(403)
      .send(`Invalid User Please try again <a href ='/login'> Login </a>`);
    } else {
      const user = getUserByEmail(email, users);
      if (password !== user["password"]) {
        res.status(403).send("Invalid password Please try again <a href ='/login'> Login </a>")
      }
      res.cookie("user_id", user["id"]);
      res.redirect("/urls");
    }
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/u/:shortURL", (req, res) => {
      const shortURL = req.params.shortURL;  
    if(urlDatabase[shortURL]) {
        const {longURL} = urlDatabase[shortURL].longURL;
        res.redirect(longURL);
    } else {
        res.status(404).send("Invalid short url");
    }
  });

  app.get("/urls/new", (req, res) => {
    const user = users[req.cookies["user_id"]];
    if (user) {
        return res.render("urls_new", {users: user});
    }
    res.status(405).send("Not Authorized to create a new URL without Login/Register <br/><a href ='/login'> Login </a> or <a href ='/register'> Register </a>");
  });

  app.post("/urls/new", (req, res) => {
    const user = users[req.cookies["user_id"]];
    if (user) {
        return res.render("urls_new", {users: user});
    }
    res.status(405).send("Not Authorized to create a new URL without Login <br/><a href ='/login'> Login here</a>");
  });

  app.get("/urls/:shortURL", (req, res) => {
    if (users[req.cookies["user_id"]]) {
        if(urlDatabase[req.params.shortURL]){
               const templateVars = 
               {
                   shortURL: req.params.shortURL,
                   longURL: urlDatabase[req.params.shortURL].longURL,
                   users: users[req.cookies["user_id"]] };
                   res.render("urls_show", templateVars);
        } else {
            res
            .status(405)
            .send("Access Denied. Please check the short url and try again <br/><a href='/urls'> Main page </a>")
        }
    }
    res
    .status(405)
    .send("Invalid URL. <br/><a href='/login'> Login </a> or <a href='/register'> Register </a> ")
  });


  app.post("/urls", (req, res) => {
    const user = users[req.cookies["user_id"]];
    if (user) {
        const newShortUrl = generateRandomString();
        const longNewURL = req.body.longURL;
        urlDatabase[newShortUrl] = {
            longURL: longNewURL,
            userID: user["id"]
        };
        res.redirect("/urls");
    }
    res.status(405).send("Not Authorized to create a new URL without Login <br/><a href ='/login'> Login here</a>");
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    const user = users[req.cookies["user_id"]];
    if (user) {
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
    res
    .status(405)
    .send("Not allowed to delete without login <br/><a href='/login'> Login here</a>")
  })

  app.post("/urls/:shortURL", (req, res) => {
    if (users[req.cookies["user_id"]]) {
        if(urlDatabase[req.params.shortURL]) {

    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.cookies["user_id"]
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
    .send("Invalid URL. <br/><a href='/login'> Login </a> or <a href='/register'> Register </a>")
  })

app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect('/login');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});