const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);

}

app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const id=generateRandomString()
  urlDatabase[id]=req.body.longURL;
  res.redirect("/urls/"+id);
  //res.send(id);         // Respond with 'Ok' (we will replace this)
});
// app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
//   });
  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
  app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  });
  app.get("/urls/:shortURL", (req, res) => {
    //console.log(req);
    const templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
  });
  app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    const longURL=urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });
  app.post("/urls/:shortURL/delete", (req, res) => {
    // const longURL = ...
    const new1=req.params.shortURL;
    delete urlDatabase[new1];
    //const longURL=urlDatabase[req.params.shortURL]
    res.redirect("/urls");
  });
  //////////////////////////////////
  app.post("/urls/:shortURL/edit", (req, res) => {
    // const longURL = ...
    //const longURL=urlDatabase[req.params.shortURL]
    const templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[req.params.shortURL]};

    res.render("urls_show",templateVars);
    
  });
  app.post("/urls/:id",(req,res) => {
    const shortURL = req.params.id;
    console.log(req.params)
    urlDatabase[shortURL]=req.body.url;
    console.log(req.body)
    res.redirect("/urls");

  });
  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});