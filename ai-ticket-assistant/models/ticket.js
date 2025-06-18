import mongoose from "mongoose";
import { type } from "os";

const ticketSchema  = new mongoose.Schema({
   title : String,
   description: String,
   status : { type: String, default: "TO-DO"},
   createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "User"},
   assignedTo : { type: mongoose.Schema.Types.ObjectId, ref: "User"},
   priority : String,
   deadline : Date,
   helpfulNotes : String,
   relatedSkills : [String],
   createdAt : { type: Date, default : Date.now}

})

export default mongoose.model("Ticket", ticketSchema);