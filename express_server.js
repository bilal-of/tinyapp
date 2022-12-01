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

const urlDatabase = {   "b2xVn2": "http://www.lighthouselabs.ca",   "9sm5xk": "http://www.google.com" };

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

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const newKey = generateRandomString() 
  const newURL = req.body['longURL'] 
  urlDatabase[newKey] = newURL
  console.log(urlDatabase) 
  res.redirect(`urls/${newKey}`); 
}); 

app.get("/urls", (req, res) => { 
  const templateVars = {  
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]  
};  
console.log("testing123", templateVars)
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => { 
  const templateVars = { 
    user: users[req.cookies["user_id"]], 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {  
    user: users[req.cookies["user_id"]],
    longURL: urlDatabase[req.params.id],   
    id: req.params.id
  };   
  console.log(templateVars)
  res.render("urls_show", templateVars);
}); 

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
}); 

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
}); 

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;  
  urlDatabase[req.params.id] = req.body.longURL

  res.redirect("/urls");
}); 

app.get("/register", (req, res) => { 
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }; 
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
      console.log("password", password) 
      console.log("user.password", user)

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
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 


//generateRandomString() 


