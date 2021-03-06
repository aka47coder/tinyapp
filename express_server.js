const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers.js');


//var cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080; // default port 8080
//app.use(cookieParser());

const cookieSession = require("cookie-session")

app.use(cookieSession({
  name: 'session',
  keys: ["mykey","backup"],

 
}))


app.set("view engine", "ejs");

const users = {
  id: {
    id: "id",
    email: "email",
    password: "password",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const bodyParser = require("body-parser");
const { application, response } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
function urlsForUser(id) {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;
}


////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const user = req.session["user"];
  //console.log('-----------------COOKIE', userCookie)
  if (req.session["user"] === undefined) {
    //res.status(403).send("User not found");
    res.render("login");
  }
  res.render("urls_new", { user });
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  const userID = req.session["user"];
  urlDatabase[id] = { longURL: req.body.longURL, userID };
  console.log("PRINTING URL DATABASE", urlDatabase);
  //[NEW URL ENTERY]

  res.redirect("/urls/" + id);
  //res.send(id);         // Respond with 'Ok' (we will replace this)
});
// app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
//   });
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const userid = req.session["user"];
  console.log("urls", urlDatabase);
  console.log("urls", userid);
  const userUrls = urlsForUser(userid);
  const templateVars = { urls: userUrls, user: users[userid] };

  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  //console.log(req);
  const userid = req.session["user"];
  if (!userid){
    res.status(400).send("you should be login");
        return;
  }
  
  const user = users[userid];
  console.log("get urls id", urlDatabase);
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== userid){
    res.status(400).send("you dont own this url");
    return;
  }

  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(400).send("This short url not exsit");
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: longURL,
    user,
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
  res.status(400).send("This short url not exsit");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  // const longURL = ...
  const new1 = req.params.shortURL;
  if (urlDatabase[new1]) {
    if (urlDatabase[new1].userID === req.session["user"]) {
      delete urlDatabase[new1];
    } else {
      res.status(400).send("you can not delete this url");
      return;
    }
  } else {
    res.status(400).send("cannot delete short url because it does not exsit");
  }

  //const longURL=urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if (!req.session["user"]) {
    res.status(400).send("We need to login page");
  }
  const shortURL = req.params.shortURL;
  //console.log(req.params)
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userID === req.session["user"]) {
      urlDatabase[shortURL].longURL = req.body.url;
    } else {
      res.status(400).send("you can not edit this url");
      return;
    }
  } else {
    res.status(400).send("cannot edit short url because it does not exsit");
  }
  // urlDatabase[shortURL].longURL = req.body.url;
  //console.log(req.body)

  res.redirect("/urls");
});
// app.post("/login",(req,res) => {
//   console.log(req.body.username);
//   res.cookie('username', req.body.username);

//   res.redirect("/urls");
//   console.log(req.cookies)
// });
app.post("/logout", (req, res) => {
  console.log("CLEARING COOKIIIIIIESSS");
  req.session=null;
  res.redirect("/urls");
});
//////////////////////////////Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // const longURL = ...
  if (req.body.email===""||req.body.password===""){
    res.status(400).send("password and email cannot be blank");
    return;
  }
  for (let item in users) {
    if (req.body.email === users[item].email) {
      res.status(400).send("email alrady exsit ");
      return;
    }
  }
  console.log(req.body);
  let userid = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userid] = {
    id: userid,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session["user"]= userid;
  res.redirect("/urls");
});
///////////////////////////Login page
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  console.log("==============", req.body);
  const email = req.body.email;
  const password = req.body.password;
  
  let user;
  for (const userid in users) {
    if (users[userid].email === email) {
      user = users[userid];
    }
  }
  if (!user) {
    return res.status(403).send("User not found");
  }
  const hashedPassword = user.password;
  ;
  bcrypt.compareSync(password, hashedPassword);
  console.log([password,hashedPassword])
  if (!bcrypt.compareSync(password, hashedPassword)) {
    return res.status(403).send("Wrong Password:Please try Again");
  }

  req.session["user"]= user.id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});