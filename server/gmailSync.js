const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const Job = require("./models/Job");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

function extractJobTitle(subject) {
  const patterns = [
    /(?:application for|applying for|position[:\s]+)([^-\|,\n]+)/i,
    /([^-\|,\n]+)(?:\s*-\s*job|position|role|opening)/i,
    /job[:\s]+([^-\|,\n]+)/i,
    /([a-zA-Z\s]+(?:engineer|developer|manager|analyst|specialist|coordinator|assistant|intern))/i,
    /([a-zA-Z\s]+(?:software|frontend|backend|full.?stack|data|web|mobile))/i,
  ];

  for (const pattern of patterns) {
    const match = subject.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  if (
    subject.toLowerCase().includes("interview") ||
    subject.toLowerCase().includes("application") ||
    subject.toLowerCase().includes("position")
  ) {
    return subject
      .split(/[-\|,]/)[0]
      .trim()
      .substring(0, 50);
  }

  return "Job Application";
}

function extractCompanyName(subject, snippet, fromEmail) {
  const subjectPatterns = [
    /from\s+([^-\|,\n]+)/i,
    /at\s+([^-\|,\n]+)/i,
    /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company|Technologies|Tech|Solutions|Systems))/,
    /@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
  ];

  for (const pattern of subjectPatterns) {
    const match = subject.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const snippetPatterns = [
    /(?:from|at|with)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company|Technologies|Tech|Solutions|Systems))/,
    /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company|Technologies|Tech|Solutions|Systems))/,
    /dear\s+(?:candidate|applicant),?\s*(?:thank you for your interest in)\s+([^.\n]+)/i,
    /([A-Z][a-zA-Z\s]+)\s+(?:team|hiring|recruiter|hr)/i,
  ];

  for (const pattern of snippetPatterns) {
    const match = snippet.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  if (fromEmail) {
    const emailMatch = fromEmail.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && emailMatch[1]) {
      const domain = emailMatch[1].replace(/^(www\.|mail\.)/i, "");
      return (
        domain.split(".")[0].charAt(0).toUpperCase() +
        domain.split(".")[0].slice(1)
      );
    }
  }

  return "Company";
}

function extractJobStatus(subject, snippet) {
  const lowerSubject = subject.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();

  const rejectionKeywords = [
    "rejected",
    "not selected",
    "unsuccessful",
    "regret to inform",
    "sorry to inform",
    "thank you for your interest",
  ];
  if (
    rejectionKeywords.some(
      (keyword) =>
        lowerSubject.includes(keyword) || lowerSnippet.includes(keyword)
    )
  ) {
    return "Rejected";
  }

  const selectionKeywords = [
    "congratulations",
    "pleased to inform",
    "offer",
    "selected",
    "move forward",
    "next round",
  ];
  if (
    selectionKeywords.some(
      (keyword) =>
        lowerSubject.includes(keyword) || lowerSnippet.includes(keyword)
    )
  ) {
    return "Selected";
  }

  const interviewKeywords = [
    "interview",
    "schedule",
    "meeting",
    "call",
    "assessment",
  ];
  if (
    interviewKeywords.some(
      (keyword) =>
        lowerSubject.includes(keyword) || lowerSnippet.includes(keyword)
    )
  ) {
    return "Applied";
  }

  return "Not Seen";
}

async function syncGmailJobs() {
  // Check if credentials exist
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error("credentials.json not found. Please add your OAuth credentials.");
  }

  // Check if token exists
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error("Not authenticated. Please authenticate with Gmail first.");
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Load and set credentials
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  // Handle token refresh
  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // Store the new refresh token
      const currentToken = JSON.parse(fs.readFileSync(TOKEN_PATH));
      currentToken.refresh_token = tokens.refresh_token;
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(currentToken, null, 2));
    }
    if (tokens.access_token) {
      // Update access token
      const currentToken = JSON.parse(fs.readFileSync(TOKEN_PATH));
      currentToken.access_token = tokens.access_token;
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(currentToken, null, 2));
    }
  });

  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const res = await gmail.users.messages.list({
      userId: "me",
      q: "subject:(job OR application OR interview OR career OR position OR hiring OR recruiter OR opportunity) newer_than:30d",
      maxResults: 20,
    });

    const messages = res.data.messages || [];
    let syncedCount = 0;

    function decodeBase64(encoded) {
      return Buffer.from(encoded, 'base64').toString('utf-8');
    }

    for (const msg of messages) {
      const full = await gmail.users.messages.get({ userId: "me", id: msg.id });
      const snippet = full.data.snippet;
      const headers = full.data.payload.headers;

      const subjectHeader = headers.find((h) => h.name === "Subject");
      const fromHeader = headers.find((h) => h.name === "From");

      const subject = subjectHeader ? subjectHeader.value : "No Subject";
      const fromEmail = fromHeader ? fromHeader.value : "";

      let emailContent = '';
      if (full.data.payload.body && full.data.payload.body.data) {
        emailContent = decodeBase64(full.data.payload.body.data);
      } else if (full.data.payload.parts) {
        const textPart = full.data.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
          emailContent = decodeBase64(textPart.body.data);
        }
      }

      const existingJob = await Job.findOne({ emailSubject: subject });
      if (existingJob) {
        continue;
      }

      const jobTitle = extractJobTitle(subject);
      const company = extractCompanyName(subject, snippet, fromEmail);
      const status = extractJobStatus(subject, snippet);

      await Job.create({
        title: jobTitle,
        company: company,
        status: status,
        emailSubject: subject,
        emailSnippet: snippet,
        senderEmail: fromEmail,
        emailContent: emailContent,
        dateApplied: new Date(parseInt(full.data.internalDate)),
      });

      syncedCount++;
      console.log(`✅ Synced: ${jobTitle} at ${company} (${status})`);
    }

    return { message: "Sync complete", count: syncedCount };
  } catch (error) {
    // Handle specific OAuth errors
    if (error.code === 401 || error.message.includes('invalid_grant')) {
      // Token is invalid, delete it
      if (fs.existsSync(TOKEN_PATH)) {
        fs.unlinkSync(TOKEN_PATH);
      }
      throw new Error("Authentication expired. Please re-authenticate with Gmail.");
    }
    throw error;
  }
}

module.exports = syncGmailJobs;