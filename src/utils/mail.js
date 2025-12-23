import Mailgen from "mailgen";
import nodemailer from "nodemailer"
//generate mail

const sendMail = async(options)=>{
    const mailGenerator = new Mailgen({
        theme : "default",
        product : {
            name : "taskmanager",
            link : "https://taskmanager.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host : process.env.MAILTRAP_SMTP_HOST,
        port : process.env.MAILTRAP_SMTP_PORT,
        auth : {
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASSWORD
        }

    })

    const mail = {
        from : "mail.taskmanager@example.com",
        to : options.email,
        subject : options.subject,
        text : emailTextual,
        html : emailHtml
    }

    try{
        await transporter.sendMail(mail)
    }catch(error){
        console.error("email service failed, MAILTRAP DEKHO APNA");
        console.log("err : " , error)
    }
}

const emailVerificationMailgenContent = function(username,verificationURL){
    return{
        body:{
            name : username,
            intro : "welcome to the app, we r excited to have u onboard",
            action : {
                instructions : "To verify ur email, click on following button",
                button : {
                    color : "#22BB66",
                    text : "Verify Your Email",
                    link : verificationURL
                },
            },
            outro : "Need Help or have Question, Reply to this Email"
        }
    }
}

const forgotPasswordMailgenContent = function(username,passswordURL){
    return{
        body:{
            name : username,
            intro : "Reseting ur password",
            action : {
                instructions : "To reset ur password, click on following button",
                button : {
                    color : "#22BB66",
                    text : "Reset Your Password",
                    link : passswordURL
                },
            },
            outro : "Need Help or have Question, Reply to this Email"
        }
    }
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendMail
}