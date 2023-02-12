require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const todoFilePath = process.env.BASE_JSON_PATH;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json());

app.use("/content", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile("./public/index.html", { root: __dirname }, err => {
    console.log(err)
  });
  // res.status(501).end();
});

app.get("/todos", (_, res) => {
  res.header("Content-Type","application/json");
  res.sendFile(todoFilePath, { root: __dirname });
  // res.status(501).end();
});

//Add GET request with path '/todos/overdue'
app.get('/todos/overdue', (req,res) => {
  // console.log(__dirname + todoFilePath)
  const data = fs.readFileSync(__dirname + todoFilePath)
  // console.log(JSON.parse(data))
  let todos = JSON.parse(data)
  
  // console.log(todos)
  let overdues = []
  let today_date = new Date()
  todos.forEach(todo => {
    const parse_date = Date.parse(todo.due)
    if(new Date(todo.due) < today_date && todo.completed === false){
      overdues.push(todo)
    }
  })
  // console.log(overdues)
  res.header("Content-Type","application/json");
  res.send(JSON.stringify(overdues,null,2))

})

//Add GET request with path '/todos/completed'
app.get('/todos/completed', (req,res) => {
  const data = fs.readFileSync(__dirname + todoFilePath)
  // console.log(JSON.parse(data))
  let todos = JSON.parse(data)
  // console.log(todos)
  let list_of_todos = todos.filter(todo => todo.completed === true)
  res.header("Content-Type","application/json");
  res.send(JSON.stringify(list_of_todos,null,2))
})

// Return a specific todo with the corresponding id
app.get('/todos/:id', (req,res) => {
  const id = req.params.id
  const data = fs.readFileSync(__dirname + todoFilePath)
  // console.log(JSON.parse(data))
  let todos = JSON.parse(data)
  // console.log(id)
  const matched_id = todos.find((el) => el.id == id);
  if(matched_id){
    res.send(JSON.stringify(matched_id, null, 2))
  } else {
    res.status(404).end()
  }
})

//Add POST request with path '/todos'
app.post('/todos', (req, res) => {
  const date_and_time = new Date()
  const {name, due} = req.body

  if (req.body && new Date(due) != 'Invalid Date'){
    console.log('worked')
    const new_todo = {id:uuidv4(), name, created:date_and_time, due, completed:false}
    // console.log(new_todo)
    const data = fs.readFileSync(__dirname + todoFilePath)
    let todos = JSON.parse(data)
    todos.push(new_todo)
    todos = JSON.stringify(todos, null, 2)
    
    fs.writeFile(__dirname + todoFilePath, todos, (err) => {
      if (err) {
        throw err;
      } else {
        res.status(201).end()
      }})

  } else {
    res.status(400).end()
  }
})

//Add PATCH request with path '/todos/:id
app.patch('/todos/:id', (req,res) => {
  const id = req.params.id
  const body = req.body
  const data = fs.readFileSync(__dirname + todoFilePath)
  // console.log(Object.keys(body).length)
  // console.log(JSON.parse(data))
  let todos = JSON.parse(data)
  const matchedProfile = todos.find((el) => el.id == id);
  // const index = todos.findIndex((el) => el.id == id);
  if(matchedProfile){
    const allowed_keys = ['name','due']
    let body_keys = Object.keys(body)

    const intersection = []

    body_keys.forEach(key => {
        if(allowed_keys.includes(key)){
            intersection.push(key)
        }
    })

    if(intersection.length === 0 || new Date(body.due) == 'Invalid Date'){
      res.status(404).end()
    }
    intersection.forEach(result => {
        matchedProfile[result] = body[result]
    })

    todos = JSON.stringify(todos, null, 2)

    // console.log(matchedProfile)
    // console.log(todos)
    // console.log(new Date(body.due) == 'Invalid Date')
    
    fs.writeFile(__dirname + todoFilePath, todos, (err) => {
      if (err) {
        throw err;
      }})
      res.status(200).end()
  } else {
    res.status(404).end()
  }
})



//Add POST request with path '/todos/:id/complete
app.post('/todos/:id/complete', (req, res) => {
  const id = req.params.id
  const data = fs.readFileSync(__dirname + todoFilePath)
  let todos = JSON.parse(data)

  const matchedProfile = todos.find((el) => el.id == id)
  if(matchedProfile){
    matchedProfile.completed = true
    // console.log(matchedProfile)
    // console.log(todos)
    todos = JSON.stringify(todos, null, 2)
    
    fs.writeFile(__dirname + todoFilePath, todos, (err) => {
      if (err) {
        throw err;
      } else {
        res.status(200).end()
      }})

  } else {
    res.status(404).end()
  }

})


//Add POST request with path '/todos/:id/undo
app.post('/todos/:id/undo', (req, res) => {
  const id = req.params.id
  const data = fs.readFileSync(__dirname + todoFilePath)
  let todos = JSON.parse(data)

  const matchedProfile = todos.find((el) => el.id == id)
  if(matchedProfile){
    matchedProfile.completed = false
    // console.log(matchedProfile)
    // console.log(todos)
    todos = JSON.stringify(todos, null, 2)
    
    fs.writeFile(__dirname + todoFilePath, todos, (err) => {
      if (err) {
        throw err;
      } else {
        res.status(200).end()
      }})

  } else {
    res.status(404).end()
  }

})

//Add DELETE request with path '/todos/:id
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  const data = fs.readFileSync(__dirname + todoFilePath)
  let todos = JSON.parse(data)
  const matchedProfile = todos.find((el) => el.id == id);
  if (matchedProfile) {
    todos = todos.filter((todo) => todo.id != id);
    // console.log(results);
    todos = JSON.stringify(todos, null, 2);
    // console.log(__dirname + "/models/profiles.json");
    // console.log(todos)
    fs.writeFile(__dirname + todoFilePath, todos, (err) => {
      if (err) {
        throw err;
      }
      res.status(200).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = app;
