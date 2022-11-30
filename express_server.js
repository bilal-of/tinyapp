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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const newKey = generateRandomString() 
  const newURL = req.body['longURL'] 
  urlDatabase[newKey] = newURL
  console.log(urlDatabase) 
  res.redirect(`urls/${newKey}`); 
}); 



app.get("/", (req, res) => {
  res.send("Hello!");
}); 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"],
};
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => { 
  const templateVars = {
    username: req.cookies["username"],
    
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {  
    username: req.cookies["username"],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  }; 
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

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)  
  res.redirect("/urls");
}); 

app.post("/logout", (req, res) => { 
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 


//generateRandomString() 


