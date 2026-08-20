
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// ── Nodemailer Transporter (Gmail) ──────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,   // deekshith29891@gmail.com
        pass: process.env.GMAIL_PASS,   // Gmail App Password (see README)
    },
});

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Portfolio server running' });
});

// ── Contact Form Endpoint ────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    // Mail to YOU (owner) ─ notification of new message
    const ownerMail = {
        from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,   // → deekshith29891@gmail.com
        subject: `📬 New Portfolio Message from ${name}`,
        html: `
            <div style="font-family:Inter,sans-serif;background:#0a0a0f;color:#fff;padding:30px;border-radius:12px;border:1px solid rgba(0,212,255,0.2);">
                <h2 style="color:#00d4ff;margin-bottom:8px;">New Message from Portfolio</h2>
                <hr style="border-color:rgba(255,255,255,0.1);margin-bottom:20px;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px 0;color:#a0a0b0;width:100px;">From</td><td style="color:#fff;font-weight:600;">${name}</td></tr>
                    <tr><td style="padding:8px 0;color:#a0a0b0;">Email</td><td><a href="mailto:${email}" style="color:#00d4ff;">${email}</a></td></tr>
                    <tr><td style="padding:8px 0;color:#a0a0b0;vertical-align:top;">Message</td>
                    <td style="color:#e0e0e0;background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;border-left:3px solid #7b2cbf;">${message.replace(/\n/g, '<br>')}</td></tr>
                </table>
                <p style="margin-top:20px;color:#555;font-size:12px;">Sent from your portfolio contact form.</p>
            </div>
        `,
    };

    // Auto-reply to the SENDER
    const autoReply = {
        from: `"Deekshith K R" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Thanks for reaching out, ${name}! 🚀`,
        html: `
            <div style="font-family:Inter,sans-serif;background:#0a0a0f;color:#fff;padding:30px;border-radius:12px;border:1px solid rgba(123,44,191,0.3);">
                <h2 style="color:#7b2cbf;">Message Received!</h2>
                <p style="color:#a0a0b0;margin-top:10px;">Hey <strong style="color:#fff;">${name}</strong>,</p>
                <p style="color:#a0a0b0;margin:15px 0;">Thanks for reaching out through my portfolio. I've received your message and will get back to you as soon as possible.</p>
                <div style="background:rgba(255,255,255,0.05);border-left:3px solid #00d4ff;padding:12px;border-radius:0 8px 8px 0;color:#e0e0e0;font-style:italic;">
                    "${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"
                </div>
                <p style="margin-top:20px;color:#a0a0b0;">Best,<br><strong style="color:#00d4ff;">Deekshith K R</strong></p>
                <hr style="border-color:rgba(255,255,255,0.05);margin:20px 0;">
                <p style="color:#555;font-size:11px;">This is an automated response. Please do not reply to this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(ownerMail);
        await transporter.sendMail(autoReply);
        console.log(`✅ Email sent from ${name} <${email}>`);
        res.json({ success: true, message: 'Transmission received!' });
    } catch (err) {
        console.error('❌ Email error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
    }
});

// ── Start Server ─────────────────────────────────────────────
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║  🚀 Portfolio API Server Running     ║
║  http://localhost:${PORT}             ║
║  Emails → deekshith29891@gmail.com   ║
╚══════════════════════════════════════╝
    `);
});

module.exports = app;

