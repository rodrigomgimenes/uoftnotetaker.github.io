// Dependencies
// =============================================================
const express = require("express");
const path    = require("path");
const fs      = require("fs");

// Sets up the Express App
// =============================================================
const app  = express();
const PORT = 3000;

const jsonFile = path.join(__dirname, "../../../db/db.json");

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// "/public" allows accessibility to all files 
app.use(express.static(path.join(__dirname + '../../../')));


// HTML Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

app.get("/notes", function(req, res) {
  res.sendFile(path.join(__dirname, "../../notes.html"));
});

// API Routes
// =============================================================

// Displays ALL notes
app.get("/api/notes", function(req, res) {
  fs.readFile(jsonFile, 'utf8', function (err, data){
    console.log(`[SERVER.js - GET = "/api/notes"] Reading notes: ${JSON.stringify(data)}`);
    return res.send((err) ? console.log(err) : JSON.parse(data));
  });
});

// Save New note - takes in JSON input
app.post("/api/notes", function(req, res) {
  // req.body hosts is equal to the JSON post sent from the user
  // This works because of our body parsing middleware
  let newNote = req.body;
  console.log(`[SERVER.js - POST = "/api/notes"] Creating new note: ${JSON.stringify(newNote)}`);

  fs.readFile(jsonFile, 'utf8', function (err1, data){
    if (err1)
      console.log(`[SERVER.js - POST = ERROR reading file] ${err1}`);
    
    let objNotes = {};
    // Getting information inside my ".json" file
    objNotes = JSON.parse(data);         
    // Adding new property "ID" to my object
    newNote.id = parseInt((typeof(objNotes[objNotes.length - 1]) === 'undefined' || typeof(objNotes[objNotes.length - 1]) === null) ? "0" : objNotes[objNotes.length - 1].id) + 1;
    // Adding NEW data 
    objNotes.push(newNote);                
    // Convert it back to JSON
    const json = JSON.stringify(objNotes); 

    fs.writeFile(jsonFile, json, 'utf8', function(err2) {
      if (err2)
        console.log(`[SERVER.js - POST = ERROR writing file] ${err2}`);

      return res.send(json);
    }); // Writing it back in my ".json" file
  });
});

// Delete a selected note
app.delete("/api/notes/:id", function(req, res) {
  console.log(`[SERVER.js - DELETE = "/api/notes/:id"] Deleting note#: ${req.params.id}`);

  fs.readFile(jsonFile, 'utf8', function (err1, data){
    if (err1)
      console.log(`[SERVER.js - DELETE = ERROR reading file] ${err1}`);

    const notesUpdated = [];
    for (let index = 0; index < JSON.parse(data).length; index++) {
      if (parseInt(req.params.id) !== JSON.parse(data)[index].id)
        notesUpdated.push(JSON.parse(data)[index]); // Adding the remaining data
    }

    const json = JSON.stringify(notesUpdated); // Convert it back to JSON
    fs.writeFile(jsonFile, json, 'utf8', function(err2) {
      if (err2)
        console.log(`[SERVER.js - DELETE = ERROR writinging file] ${err2}`);

      return res.send(json);
    }); // Writing it back in my ".json" file
  });
});


// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log(`[SERVER.js] App listening on PORT ${PORT}`);
});
