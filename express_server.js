const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/urls", (req, res) => {
      const cookie = req.cookies["username"];
      if (cookie == " "){
          res.render("urls_index");
      } else {
    const templateVars = {
        username: cookie,
        urls: urlDatabase
      };
    res.render("urls_index", templateVars);
      }
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/u/:shortURL", (req, res) => {  
    const longURL = urlDatabase[req.params.shortURL];
   res.redirect(longURL);
  
  });

  app.get("/urls/new", (req, res) => {
    const templateVars = {
        username: req.cookies["username"]
      };  
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL,
         longURL: urlDatabase[req.params.shortURL],
        username: req.cookies["username"] };
    res.render("urls_show", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: req.params.longURL,
      username: req.cookies["username"]
    }
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req, res) => {
    const newShortUrl = generateRandomString();
    const longNewURL = req.body.longURL;
    urlDatabase[newShortUrl] = longNewURL;
    res.redirect("/urls");
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect("/urls");
  })

  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect("/urls");
  })

app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookie("username", username);
    res.redirect("/urls");
})

app.post("/logout", (req, res) => {
    const username = req.body.username;
    res.cookie("username", username);
    res.clearCookie("username");
    res.redirect('/urls');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

