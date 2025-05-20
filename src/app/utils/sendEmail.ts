// src/app/utils/sendEmail.ts
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function sendEmail(visitorEmail: string, qr_code_url: string, emailType: string) {
  const email = '2021255646@ub.edu.bz';

  // Generate QR Code as base64 string
  const qrCodeDataURL = await QRCode.toDataURL(qr_code_url);
let htmlContent = "";
  if(emailType == 'visitor') {

htmlContent = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #2c3e50; text-align: center;">Visitor Schedule Confirmation</h2>
      <p>Dear Visitor,</p>
      <p>You have been scheduled for a visit to our gated community. Please find your unique QR code below, which you must present to the security personnel at the entrance.</p>
      <div style="text-align: center; margin: 20px 0;">
        <img src="${qrCodeDataURL}" alt="QR Code" style="width: 180px; height: 180px;" />
      </div>
      <p style="text-align: center; font-weight: bold;">This QR code is required for your entry.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 0.9em; color: #555;">If you have any questions, please contact the resident who scheduled your visit or reach out to the community management.</p>
      <p style="text-align: center; color: #999; font-size: 0.85em;">&copy; ${new Date().getFullYear()} Gated Community Management</p>
    </div>
  </div>
`;
  }else if (emailType == 'feedback') {
    htmlContent = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #2c3e50; text-align: center;">We Value Your Feedback</h2>
      <p>Dear Visitor,</p>
      <p>Thank you for visiting our gated community. We hope your experience was pleasant and smooth.</p>
      <p>Please take a moment to share your thoughts with us. Your feedback helps us improve our services and ensure a safe, welcoming environment for everyone.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${qr_code_url}" style="background-color: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Give Feedback</a>
      </div>
      <p style="text-align: center; font-weight: bold;">If the link does not work see url: "${qr_code_url}"</p>

      <p style="text-align: center; font-size: 0.95em;">Use your discretion and let us know how your time at the community went.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 0.9em; color: #555;">If you have any questions or concerns, feel free to reach out to the resident who invited you or the community management.</p>
      <p style="text-align: center; color: #999; font-size: 0.85em;">&copy; ${new Date().getFullYear()} Gated Community Management</p>
    </div>
  </div>
`;

  }


  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to: visitorEmail,
      subject: "Visitor Schedule",
      html: htmlContent,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ success: false });
  }
}
