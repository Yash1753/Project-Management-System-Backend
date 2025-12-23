import Mailgen from "mailgen";

//generate mail

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
    forgotPasswordMailgenContent
}