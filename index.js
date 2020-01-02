const mongo = require("mongodb");

const client = new mongo.MongoClient("mongodb://localhost:27017", {
  useNewUrlParser: true
});

function addNewToDo(todosCollection, title) {
  todosCollection.insertOne(
    {
      title,
      done: false
    },
    err => {
      if (err) {
        console.log("Error during trying to add");
      } else {
        console.log("The task has been added");
      }
    }
  );
  client.close();
}

function showAllToDos(todosCollection) {
  todosCollection.find().toArray((err, todos) => {
    if (err) {
      console.log("Error during trying to display the list of tasks");
    } else {
      console.log("The list has been displayed", todos);

      const todosToDo = todos.filter(todo => !todo.done);
      const todosDone = todos.filter(todo => todo.done);

      console.log("# To do: ");

      for (const todo of todosToDo) {
        console.log(
          `- ${todo.title} - ${todo.done ? "Task finished" : "Task to do"}`
        );
      }

      console.log("# Done: ");

      for (const todo of todosDone) {
        console.log(
          `- ${todo.title} - ${todo.done ? "Task finished" : "Task to do"}`
        );
      }
    }
  });
  client.close();
}

function markTaskAsDone(todosCollection, title) {
  todosCollection.find({ title }).toArray((err, todos) => {
    if (err) {
      console.log("Error during updating status");
    } else if (todos.length !== 1) {
      console.log("Nie ma takiego zadania");
      client.close();
    } else if (todos[0].done) {
      console.log("To zadanie zostało już zakończone");
      client.close();
    }  
    else {
      todosCollection.updateOne(
        {
          title
        },
        {
          $set: {
            done: true
          }
        },
        err => {
          if (err) {
            console.log("Error during update", err);
          } else {
            console.log("All good");
            client.close();
          }
        }
      );
    }
  });
}

function doTheToDo(todosCollection) {
  const [command, ...args] = process.argv.splice(2);
  console.log(command, args);
  switch (command) {
    case "add":
      addNewToDo(todosCollection, args[0]);
      break;
    case "list":
      showAllToDos(todosCollection);
      break;
    case "done":
      markTaskAsDone(todosCollection, args[0]);
      break;
    default:
      console.log('Wrong command, please correct');
      client.close()
      break;
  }
}

client.connect(err => {
  if (err) {
    console.log("Connection error", err);
  } else {
    console.log("Conection successful");

    const db = client.db("test");

    const todosCollection = db.collection("todos");

    doTheToDo(todosCollection);

    // client.close();
  }
});
