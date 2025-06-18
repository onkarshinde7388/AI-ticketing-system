import {} from "inngest";
import Ticket from "../models/ticket.js";
import { inngest } from "../inngest/client.js";


export const createTicket = async(req, res) => {
     try {
        const { title, description } = req.body;
        if(!title || !description) {
            return res.status(401).json({message : "Title and Description are required"});    
        }

        const newTicket = await Ticket.create({
            title,
            description,
            createdBy : req.user._id.toString(),
        })

        await inngest.send({
            name:"ticket/created",
            data: {
                ticketId : (await newTicket)._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString(),
            }
        })
        return res.status(201).json({message: "Ticket created and processing started", ticket: newTicket});
     } catch (error) {
        console.error("Error in creating Ticket");
        return res.status(500).json({message: "Internal Server Error"});
     }
}

export const getTickets = async (req, res) => {
    try {
        const user = req.user
    let tickets = [];
    if(user.role!=="user") {
        tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({createdAt : -1})
    }
    return res.status(200).json(tickets);
    } catch (error) {
        console.error("Error in fetching Tickets");
        return res.status(500).json({message: "Internal Server Error"});
    }
    
}

export const getTicket = async (req, res) => {
    try {
        const user = req.body;
        let ticket;
        if(user.role !==  "user") {
            ticket = Ticket.findById(req.params.id)
            .populate("assignedTo", ["email", "_id"]);
        } else {
            ticket = Ticket.findOne({
                createdBy : user._id,
                _id: req.params.id
            }).select("Title description status createdAt")
        }
        if(!ticket) {
            return res.status(404).json({message: "Ticket not found"})
        }
        return res.json(ticket)
    } catch (error) {
         console.error("Error in fetching Ticket");
        return res.status(500).json({message: "Internal Server Error"});
    }
}