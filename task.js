const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "must provide a name for the task"],
        maxlength:[50, "Cannot be more then 50 chars"]
    },
    completed:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model("tasks", TaskSchema);