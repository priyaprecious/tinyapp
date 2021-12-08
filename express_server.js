const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/u/:shortURL", (req, res) => {  
    const longURL = urlDatabase[req.params.shortURL];
   res.redirect(longURL);
  
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] /* What goes here? */ };
    res.render("urls_show", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: req.params.longURL
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

