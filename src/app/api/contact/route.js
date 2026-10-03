import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, email, phone, message, honeypot } = await req.json();

    // Honeypot check for bots
    if (honeypot) {
      // Silently discard but return success to fool the bot
      return NextResponse.json(
        { success: true, message: 'Email sent successfully!' },
        { status: 200 }
      );
    }

    // Field Validation on the backend
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Configure the email transport using SMTP details
    // You should put these in your .env.local file
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'nandakishore.p.r2002@gmail.com',
        pass: process.env.SMTP_PASS || "nelp pvtx uxku kxio",
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER || '"Lumora Contact" <noreply@lumora.com>',
      to: process.env.CONTACT_EMAIL_RECEIVER || 'contact@asdf.com', // Where emails will be sent
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2C3B5E;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please check your SMTP configuration.' },
      { status: 500 }
    );
  }
}
