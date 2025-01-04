import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { feedback } = await req.json()

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "support@agentx.biz",
      subject: "New Feedback Submission",
      text: feedback,
      html: `<div>
        <h2>New Feedback Received</h2>
        <p>${feedback}</p>
      </div>`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending feedback:", error)
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    )
  }
}
