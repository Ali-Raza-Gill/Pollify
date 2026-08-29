import nodemailer from 'nodemailer';


// Parse the port to a Number once
const port = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465, // Evaluates to true if port is 465, false otherwise
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTPEmail = async (to, otp, reason='Verify your email') => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 450px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333; text-align: center; margin-top: 0;">${reason||'Verify your email'}</h2>
            <p style="color: #555; font-size: 14px; text-align: center;">Use the code below to complete your verification:</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #007bff; border-radius: 5px; margin: 20px 0;">
                ${otp||123456}
            </div>
            
            <p style="color: #777; font-size: 12px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        `;
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: reason,
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
};