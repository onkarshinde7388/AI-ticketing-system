import nodemailer from "nodemailer";

export const sendMail = async(to, subject, from) => {
  try{
 const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS, 
  },
});

(async () => {
  const info = await transporter.sendMail({
    from: 'Inggest TMS',
    to,
    subject,
    text,
   
  });

  console.log("Message sent:", info.messageId);
  return info;
});

} catch( err ) {
   console.error("Mail error", err.message) 
}
};