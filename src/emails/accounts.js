const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'sourabhsingh01998@gmail.com',
        subject: 'Thanks for Joining in!',
        text: `Welcome to the app, ${name}.`
    })
}

const sendDeleteAccountEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'sourabhsingh01998@gmail.com',
        subject: 'Account Deletion',
        text: `${name} your account is deleted succussfully.`
    })
}

module.exports ={
    sendWelcomeEmail,
    sendDeleteAccountEmail
}