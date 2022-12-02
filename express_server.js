const express = require("express"); 
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
app.use(cookieParser())

app.set("view engine", "ejs"); 

const generateRandomString = function () {
  const result = Math.random().toString(36).substring(2,8);
  return result;
} 

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}; 

const getUserfromReq = function (user_id, database) {  
  const userUrl = {} 
  for (const url in database) { 
    if (database[url].userID === user_id) {
      userUrl[url] = database[url].longURL
    } 
  } 
  return userUrl
}; 

const getUserByEmail = function (email, database) { 
  for (let user_id in database) { 
    if (database[user_id].email === email) {
      return database[user_id]
    }
  } 
  return null
} 

function urlsForUser(id, database) {
  const obj = {};
  for (const key in database) {
    if (database[key].userID === id) {
      obj[key] = database[key];
    }
  }
  return obj;
};

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => { 
  const userId = req.cookies["user_id"]
  if (!userId) {
    res.status(400).send("You are not logged in");  
    return
  }
  console.log(req.body); // Log the POST request body to the console
  const newKey = generateRandomString() 
  const newURL = req.body['longURL'] 
  urlDatabase[newKey] = {
    longURL: newURL, 
    userId
  }  
  res.redirect(`urls/`); 
}); 

app.get("/urls", (req, res) => { 
  if (req.cookies["user_id"]) { 
    const templateVars = {  
      urls: urlsForUser(req.cookies["user_id"].id, urlDatabase),
      user: users[req.cookies["user_id"]]   
    } 
    res.render("urls_index", templateVars); 
    return
  } else {
    res.status(400).send("You are not logged in");  
  }
}); 

app.get("/urls/new", (req, res) => { 
  const templateVars = { 
    user: users[req.cookies["user_id"]], 
  }; 
  if (!req.cookies["user_id"]) {
    res.redirect("/login") 
    return
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { 
  const userId = req.cookies["user_id"]
  if (!userId) {
    res.status(400).send("You are not logged in");  
    return
  }
  const shortURL = req.params.id
  const user = users[userId]
  const userURLS = urlsForUser(user.id, urlDatabase)
  const doesUrlBelong = userURLS[shortURL.userID] === urlDatabase[shortURL].userID
  if (doesUrlBelong) {  
    //restrict user b from user a url 
    //urlDatabase[req.params.id].userID
    const templateVars = {  
      user,
      longURL: urlDatabase[req.params.id].longURL,   
      id: shortURL
    };   
    res.render("urls_show", templateVars);
    return
} else {
  res.status(400).send("Do not have access");  
}
  
}); 

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL 
  const shortURL = req.params.id
  if (!urlDatabase[shortURL].longURL) {
    res.status(400).send("Shortened ID does not exist"); 
    return
  }
  res.redirect(longURL);
}); 

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"]
  if (!userId) {
    res.status(400).send("You are not logged in");  
    return
  }
  const id = req.params.id; 
  const user = users[req.cookies["user_id"]]   
  console.log('ID', id) 
  console.log('User', user) 
  console.log(urlDatabase[id])
  if (user.id === urlDatabase[id].userId) {
    delete urlDatabase[id]; 
    return res.redirect("/urls");  
    
} else {
  res.status(400).send("Do not have access"); 
}
}); 

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;  
  urlDatabase[req.params.id].longURL = req.body.longURL

  res.redirect("/urls");
}); 

app.get("/register", (req, res) => { 
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }; 
  if (req.cookies["user_id"]) {
    res.redirect("/urls")  
    return
  }
  res.render("urls_register", templateVars);
});  

app.post("/register", (req, res) => { 
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("Email/password are empty"); 
    return;

  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("User already exists."); 
    return;
  }
  const id = generateRandomString(); 
  users[id] = {
    id, 
    email: req.body.email, 
    password: req.body.password
  }  
  res.cookie('user_id', id)  
  console.log(users)
  res.redirect("/urls");
}); 

app.get("/login", (req, res) => {  
  const templateVars = { 
    user: getUserfromReq(req)
  }; 
  if (req.cookies["user_id"]) {
    res.redirect("/urls") 
    return
  }
  res.render("urls_login", templateVars);
});  


app.post("/login", (req, res) => {
  const email = req.body.email 
  const password = req.body.password 
  if (email === '' || password === '') {
    res.status(403).send("Cannot leave fields empty")
  } else {
    let user = getUserByEmail(email, users) 
    if (!user) {
      res.status(403).send("User not found")
    } else { 
      if (password !== user.password) {
        res.status(403).send("Passwords is not valid")
      } else {
        res.cookie('user_id', user.id) 
        res.redirect("/urls")
      }
    }
  }
});
 

app.post("/logout", (req, res) => { 
  res.clearCookie('user_id')
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 


//generateRandomString() 


