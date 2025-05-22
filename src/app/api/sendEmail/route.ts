// /app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { sendEmail } from "@/app/utils/sendEmail"; // Import your email sending function
export async function POST(req: Request) {
  try {
    const { visitorEmail, qr_code_url, emailType,enterDate,exitDate } = await req.json();

    if (!visitorEmail || !qr_code_url || !emailType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    await sendEmail(visitorEmail, qr_code_url, emailType, enterDate, exitDate);
   

    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error("Failed to send email:", error);
    return NextResponse.json({ success: false, error: "Email failed to send" }, { status: 500 });
  }
}
