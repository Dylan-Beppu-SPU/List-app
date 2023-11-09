//https://www.w3schools.com/tags/ref_httpmethods.asp

const express = require("express");
const connectDB = require("./connect.js")
// const mongoose = require("mongoose");


const port = 8080;
const appName = "ToDo managers";
const app = express();


app.use(express.json());
const tasks = require("./task.js");

app.use(express.static("./Client"));


// let testData = [
//     "primaryKey" = [
//         "Status"  = true,
//         "Text" = "Lorem"
//     ]
// ]


/**
 * Need:
 * get: get info out
 * post: add new data/doc
 * put: update existing data
 * delete: remove
 */


//Get the data, retruns evrything
app.get("/api", async(req,res) => {
    try{
        const task = await tasks.find();
        res.status(200).json({task});
    } catch (error) {
        res.status(500).json({msg: error});
    }
});


    // let data = ["Hello world!"];
    // if (data === -1) {
    //     res.status(400).send();
    //     return;
    // }
    // res.status(200).send(data);

//Post, adds a new item, also sends back the new id of a obj
app.post("/api", async(req,res) => {
    const newData = {
        name: req.body.text,
        completed: false
    };

    const newTask = new tasks(newData);

    try {
        const savedTask = await newTask.save();
        console.log(savedTask);
        res.status(200).json(savedTask);
    } catch (error) {
        res.status(500).json({msg: error});
    }
});


//Put, updates the item
app.put("/api", async(req,res) => {
    // let jsonString = JSON.stringify(req.body);
    console.log(req.body.key);
    // let namu = req.body.text;
    // let stat = req.body.status;
    let update = {name: req.body.text, completed: req.body.status};
    // update[name] = req.body.text;
    // update[completed] = req.body.status;


    try{
        const updatedTask = await tasks.findByIdAndUpdate({_id: req.body.key}, update,  { new: true })
        console.log(updatedTask);
        res.status(200).json(updatedTask);
    } catch (error){
        res.status(500).json({msg: error});

    }
});


//Removes a item from the list
app.delete("/api/:key", async(req,res) => {
    const key = req.params.key;
    console.log(key);

    try {
        const deletedTask = await tasks.findByIdAndDelete(key);
        if (!deletedTask) {
            return res.status(404).json({msg: "No task found with this id"});
        }
        res.status(200).json({msg: "Task deleted successfully"});
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({msg: error.message});
    }
});


//page not found route
app.all("*", (req,res) => {
    res.status(404).send("<h1>Page Not Found...</h1>");
});
  
//Connect to the database and start the server
const start = async () => {
    try {
        await connectDB();
        app.listen(port, () => {console.log(`App ${appName} is running on port ${port}`)});
    } catch (error) {
        console.log(error);
    }
};

start();



// app.listen(port, () => {
//     console.log(`App ${appName} is running on port ${port}`);
// })