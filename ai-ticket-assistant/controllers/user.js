import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {inngest} from "../inngest/client.js"
import { json } from "stream/consumers";
import user from "../models/user.js";

export const signup = async(req, res) => {
    const {email, password, skills =[]} = req.body;
    try {
        const hashed = bcrypt.hash(password, 10);
        const user = await User.create({email, password: hashed, skills});

        //fire inngest event
        await inngest.send({
            name: "user/signup",
            data: { email },
        });

        const token = await jwt.sign({_id: user._id, role: user.role}, process.env.JWT_TOKEN);

        const userObj = user.toObject();
        delete userObj.password;
        res.json({ user: userObj, token });


    } catch (error) {
        res.status(500).json({error: "Signup Failed", details: error.message});
    }
}

export const login  = async(req, res) => {
     const {email, password} = req.body;

     try {
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({error: "User not found"});

        const isMatch = await bcrypt.compare(password, user.password);


        if(!isMatch) return res.status(401).json({error: "Invalid Credentials"});
        
        const token = await jwt.sign({_id: user._id, role: user.role}, process.env.JWT_TOKEN);

        const userObj = user.toObject();
        delete userObj.password;
        res.json({ user: userObj, token });

     } catch (error) {
        res.status(500).json({error: "Login Failed", details: error.message});
     }
}

export const logout  = async(req, res) => {
    try {
        const token = req.headers.authorization.split( " " )[1];
        if(!token) return res.status(401).json({error: "Unauthorized"});
        jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
            if(err) return res.status(401).json({error: "Unauthorized"})
        })
        res.json({message : "Logout successfully!"});
    } catch (error) {
        res.status(500).json({error: "Logout Failed", details: error.message});
    }
}

export const updateUser = async(req, res) => {
    const {skills = [], role, email } = req.body;
    try {
        if(req.user?.role !== "admin") {
            return res.status(401).json({error: "Forbidden"});
        }
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({error: "User not found"});
        await user.updateOne(
            { email },
            {skills: skills.length ? skills : user.skills, role}
         )
         return res.json({message: "User updated successfully!"});
        
    } catch (error) {
         res.status(500).json({error: "Update Failed", details: error.message});
    }
}

export const getUsers = async(req, res) => {
    try {
         if(req.user?.role !== "admin") {
            return res.status(401).json({error: "Forbidden"});
        }
        const users = await User.find().select(-password);
        return res.json(users);
    } catch (error) {
        res.status(401).json({error: "GetUser Failed", details: error.message});
    }
}