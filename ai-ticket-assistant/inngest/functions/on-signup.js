import  { inngest } from "../client.js";
import { NonRetriableError } from "inngest";
import User from "../../models/user.js"
import { send } from "process";


export const onUserSignup = inngest.createFunction(
    { id: "on-user-signup", retries:2 },
    { event: "user/signup" },
  async ({ event, step }) => {
    try{
        const {email} = event.data;
        const user = await step.run("get-user-email", async()=> {
        const userObject = await User.findOne({email});
        if(!userObject) {
            throw new NonRetriableError("User no longer exist in our DB");
        }
        return userObject;
        })
        
        await step.run("send-welcome-email", async() => {
            const subject = `Welcome to the app`;
            const message = `Hii!`
            /n/n
            `Thanks for signing up. We are glad to have you!`
             await sendMail(user.email, subject, message )
        })

        return {success: true};

    } catch(err) {
            console.error("Error running step", err.message);
            return {success: false }
    }
  }
)
