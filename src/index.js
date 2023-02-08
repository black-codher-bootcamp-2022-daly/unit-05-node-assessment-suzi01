require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const port = 8080;
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const todoFilePath = process.env.BASE_JSON_PATH;

//Read todos from todos.json into variable
let todos = require(__dirname + todoFilePath);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json());

app.use("/content", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.status(200).sendFile("./public/index.html", { root: __dirname }, (err) => {
    console.log(err)
  });
  // res.status(200).end();
});

app.get('/todos', (_, res) => {

  res.header("Content-Type","application/json");
  res.status(200)
  res.sendFile(todoFilePath, { root: __dirname });

  // res.status(501).end();
});

//Add GET request with path '/todos/overdue'
app.get('/todos/overdue', (req,res) => {
  // console.log(todos)
  let overdues = []
  let today_date = new Date()
  todos.forEach(todo => {
    const parse_date = Date.parse(todo.due)
    if(parse_date < today_date){
      overdues.push(todo)
    }
  })
  console.log(overdues)
  res.send(overdues)

})

//Add GET request with path '/todos/completed'
app.get('/todos/completed', (req,res) => {
  // console.log(todos)
  let list_of_todos = todos.filter(todo => todo.completed === true)
  res.send(list_of_todos)
})

// Return a specific todo with the corresponding id
app.get('/todos/:id', (req,res) => {
  const id = req.params.id
  console.log(id)
  if(id == 'overdue'){
    res.redirect('/todos/overdue')
  }
  const matched_id = todos.find((el) => el.id == id);
  if(matched_id){
    res.send(matched_id)
  } else {
    res.status(400)
  }
})



//Add POST request with path '/todos'
app.post('/todos', (req, res) => {
  const date_and_time = new Date()
  const {name, due} = req.body

  if (req.body && Date(due) instanceof Date){
    const new_todo = {id:uuidv4(),name, date_and_time, completed}
    console.log(new_todo)
  }
  console.log(name)
  console.log(Date(due) instanceof Date)
  console.log(date_and_time)
  
})

//Add PATCH request with path '/todos/:id

//Add POST request with path '/todos/:id/complete

//Add POST request with path '/todos/:id/undo

//Add DELETE request with path '/todos/:id

app.listen(port, function () {
    console.log(`Node server is running... http://localhost:${port}`);
});

module.exports = app;