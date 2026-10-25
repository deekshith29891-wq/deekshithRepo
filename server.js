
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

// ── Live LeetCode Intelligence Cache & Service ───────────────
const https = require('https');

let leetcodeCache = {
    data: null,
    lastFetched: 0,
    etag: null
};

function fetchLeetCodeFromUpstream(username = 'deekshithkr') {
    return new Promise((resolve, reject) => {
        const query = JSON.stringify({
            query: `query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                        totalSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                    profile {
                        ranking
                        reputation
                        starRating
                    }
                    submissionCalendar
                }
                userContestRanking(username: $username) {
                    attendedContestsCount
                    rating
                    globalRanking
                    totalParticipants
                    topPercentage
                }
                recentSubmissionList(username: $username, limit: 15) {
                    title
                    titleSlug
                    timestamp
                    statusDisplay
                    lang
                }
            }`,
            variables: { username }
        });

        const req = https.request('https://leetcode.com/graphql', {
            method: 'POST',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': `https://leetcode.com/u/${username}/`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error('Failed to parse LeetCode response JSON'));
                    }
                } else {
                    reject(new Error(`LeetCode API returned status ${res.statusCode}`));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('LeetCode API request timed out'));
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(query);
        req.end();
    });
}

// Transform raw LeetCode data into verified intelligence analytics
function processLeetCodeData(raw) {
    const user = raw?.data?.matchedUser;
    if (!user) {
        throw new Error('LeetCode user profile not found or matched');
    }

    const acStats = user.submitStats?.acSubmissionNum || [];
    const totalStats = user.submitStats?.totalSubmissionNum || [];

    const getCount = (arr, diff) => {
        const item = arr.find(x => x.difficulty.toLowerCase() === diff.toLowerCase());
        return item ? item.count : 0;
    };
    const getSubs = (arr, diff) => {
        const item = arr.find(x => x.difficulty.toLowerCase() === diff.toLowerCase());
        return item ? item.submissions : 0;
    };

    const totalSolved = getCount(acStats, 'All');
    const easySolved = getCount(acStats, 'Easy');
    const mediumSolved = getCount(acStats, 'Medium');
    const hardSolved = getCount(acStats, 'Hard');

    const totalAcceptedSubs = getSubs(acStats, 'All');
    const totalAllSubs = getSubs(totalStats, 'All');
    const acceptanceRate = totalAllSubs > 0 
        ? ((totalAcceptedSubs / totalAllSubs) * 100).toFixed(1) 
        : null;

    // Parse submission calendar: unix timestamp -> submission count
    let calendarMap = {};
    try {
        calendarMap = JSON.parse(user.submissionCalendar || '{}');
    } catch (e) {
        calendarMap = {};
    }

    // Convert timestamps to YYYY-MM-DD
    const dateCounts = {};
    let totalActiveDays = 0;
    let totalActivitySubmissions = 0;

    Object.keys(calendarMap).forEach(tsStr => {
        const ts = parseInt(tsStr, 10);
        if (!isNaN(ts)) {
            const count = calendarMap[tsStr];
            const d = new Date(ts * 1000);
            const dateKey = d.toISOString().split('T')[0];
            dateCounts[dateKey] = (dateCounts[dateKey] || 0) + count;
            totalActiveDays++;
            totalActivitySubmissions += count;
        }
    });

    // Calculate streaks & period activity
    const now = new Date();
    const sortedDates = Object.keys(dateCounts).sort();

    // Longest streak
    let maxStreak = 0;
    let currentRun = 0;
    let prevDate = null;

    sortedDates.forEach(dateStr => {
        const curDate = new Date(dateStr);
        if (prevDate) {
            const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentRun++;
            } else if (diffDays > 1) {
                currentRun = 1;
            }
        } else {
            currentRun = 1;
        }
        if (currentRun > maxStreak) {
            maxStreak = currentRun;
        }
        prevDate = curDate;
    });

    // Current streak (checking from today or yesterday backward)
    let currentStreak = 0;
    const formatYMD = d => d.toISOString().split('T')[0];

    const todayStr = formatYMD(now);
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayStr = formatYMD(yesterday);

    let checkDate = dateCounts[todayStr] ? now : (dateCounts[yesterdayStr] ? yesterday : null);

    if (checkDate) {
        let runner = new Date(checkDate);
        while (true) {
            const ymd = formatYMD(runner);
            if (dateCounts[ymd] && dateCounts[ymd] > 0) {
                currentStreak++;
                runner.setDate(runner.getDate() - 1);
            } else {
                break;
            }
        }
    }

    // Daily, weekly, monthly submission counts
    const todaySubmissions = dateCounts[todayStr] || 0;

    let weeklySubmissions = 0;
    for (let i = 0; i < 7; i++) {
        const pastD = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        weeklySubmissions += (dateCounts[formatYMD(pastD)] || 0);
    }

    let monthlySubmissions = 0;
    for (let i = 0; i < 30; i++) {
        const pastD = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        monthlySubmissions += (dateCounts[formatYMD(pastD)] || 0);
    }

    // Recent submissions
    const recentSubs = (raw?.data?.recentSubmissionList || []).map(item => ({
        title: item.title,
        titleSlug: item.titleSlug,
        timestamp: parseInt(item.timestamp, 10),
        statusDisplay: item.statusDisplay,
        isAccepted: item.statusDisplay?.toLowerCase() === 'accepted',
        lang: item.lang
    }));

    const contest = raw?.data?.userContestRanking;

    return {
        profile: {
            username: user.username,
            profileUrl: `https://leetcode.com/u/${user.username}/`,
            ranking: user.profile?.ranking || null,
            starRating: user.profile?.starRating || null,
            contestRating: contest?.rating ? Math.round(contest.rating) : null,
            attendedContests: contest?.attendedContestsCount || 0,
            contestRanking: contest?.globalRanking || null
        },
        stats: {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            totalSubmissions: totalAllSubs,
            totalAcceptedSubmissions: totalAcceptedSubs,
            acceptanceRate: acceptanceRate ? `${acceptanceRate}%` : 'Unavailable',
            currentStreak,
            longestStreak: maxStreak,
            totalActiveDays,
            totalActivitySubmissions,
            todaySubmissions,
            weeklySubmissions,
            monthlySubmissions
        },
        heatmap: {
            dateCounts,
            totalDays: Object.keys(dateCounts).length
        },
        recentSubmissions: recentSubs,
        lastSynchronized: new Date().toISOString()
    };
}

// ── Live LeetCode API Endpoint ──────────────────────────────
app.get('/api/leetcode', async (req, res) => {
    const CACHE_TTL_MS = 60 * 1000; // 60 seconds server-side cache
    const now = Date.now();
    const forceRefresh = req.query.refresh === 'true';

    if (!forceRefresh && leetcodeCache.data && (now - leetcodeCache.lastFetched < CACHE_TTL_MS)) {
        return res.json({
            success: true,
            source: 'cache',
            cachedAt: new Date(leetcodeCache.lastFetched).toISOString(),
            data: leetcodeCache.data
        });
    }

    try {
        const raw = await fetchLeetCodeFromUpstream('deekshithkr');
        const processed = processLeetCodeData(raw);

        leetcodeCache.data = processed;
        leetcodeCache.lastFetched = now;

        res.json({
            success: true,
            source: 'live',
            syncedAt: processed.lastSynchronized,
            data: processed
        });
    } catch (err) {
        console.error('LeetCode API fetch error:', err.message);

        // Fallback gracefully to stale cache if available
        if (leetcodeCache.data) {
            return res.json({
                success: true,
                source: 'stale_cache',
                warning: 'Upstream LeetCode API failed, serving last known good snapshot',
                syncedAt: leetcodeCache.data.lastSynchronized,
                data: leetcodeCache.data
            });
        }

        res.status(503).json({
            success: false,
            error: 'Failed to fetch live LeetCode statistics. Service temporarily unavailable.',
            details: err.message
        });
    }
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

