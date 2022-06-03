//import http from "http";
const fs = require("fs");
const http = require("http");
const { stringify } = require("querystring");

let todos;

function saveTodos(todos) {
  fs.writeFile("todo.json", JSON.stringify(todos), "utf-8", (err) => {
    if (err) throw err;
  });
}

function readTodos() {
  fs.readFile("todo.json", "utf-8", (err, data) => {
    if (err) throw err;
    const json = data;
    todos = JSON.parse(json);
  });
}
readTodos();

const app = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, DELETE, OPTIONS, POST, PUT"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  if (req.method === "OPTIONS") {
    res.end();
  }

  const url = req.url;
  const items = url.split("/");
  const method = req.method;
  // /todos => ["", "todos"]
  // /todos/1 => ["", "todos", "1"]
  const path = items[1];
  let id = null;
  if (items.length > 2) {
    id = parseInt(items[2]);
  }

  if (method === "GET" && path === "todos") {
    res.end(JSON.stringify(todos));
  }

  if (method === "GET" && path === "todos" && id !== null) {
    const requestedId = parseInt(items[2]);
    const foundTodo = todos.find((todo) => todo.id === requestedId);
    res.end(JSON.stringify(foundTodo));
  }

  if (method === "POST" && items[1] === "todos" && items.length === 2) {
    req.on("data", (chunk) => {
      const data = JSON.parse(chunk);
      let newTodo = {
        id: Math.floor(Math.random() * 100000),
        task: data.task,
        done: false,
      };
      todos.push(newTodo);
      saveTodos(todos);
      res.statusCode = 200;
      res.end();
    });
  }
  if (method === "PUT" && path === "todos" && id !== null) {
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    req.on("data", (chunk) => {
      todos[todoIndex] = JSON.parse(chunk);
    });
    res.statusCode = 200;
    res.end();
  }
  if (method === "PATCH" && path === "todos" && id !== null) {
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    req.on("data", (chunk) => {
      const data = JSON.parse(chunk);
      let todo = todos[todoIndex];

      if (data.task) {
        todo.task = data.task;
      }

      if (typeof data.done === "boolean") {
        todo.done = data.done;
      }

      todos[todoIndex] = todo;
      res.statusCode = 200;
      res.end(JSON.stringify(todo));
      saveTodos(todos);
    });
  }

  if (method === "DELETE" && path === "todos") {
    const requestedId = parseInt(items[2]);
    todos = todos.filter((todo) => todo.id !== requestedId);

    res.statusCode = 200;
    console.log("Todo är nu raderad");

    res.end(JSON.stringify(todos));
  }
});

app.listen(4000, () => {
  console.log("Servern lyssnar på port 4000");
});
/*
GET /todos - Hämta alla todos
GET /todos/:id - Hämta en todo
POST /todos - Lägg till en todo
PUT /todos/:id - Ändra en Todo (full)
PATCH /todos/:id - Ändra en todo (partial)
DELETE /todos/:id - Ta bort en todo
.../:id 
.../1
*/
