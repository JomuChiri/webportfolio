const Busboy = require("busboy");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "muchirijosmuchiri@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "WebPortfolio <onboarding@resend.dev>";

function getHeader(headers, name) {
  if (!headers) return "";
  const lower = name.toLowerCase();
  return headers[name] || headers[lower] || "";
}

function parseUrlEncoded(body) {
  const params = new URLSearchParams(body || "");
  return Object.fromEntries(params.entries());
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = getHeader(req.headers, "content-type");
    const bb = Busboy({ headers: { "content-type": contentType } });
    const fields = {};
    let cvUploaded = false;
    let cvFileName = "";

    bb.on("field", (name, value) => {
      fields[name] = typeof value === "string" ? value.trim() : value;
    });

    bb.on("file", (name, file, info) => {
      const { filename } = info || {};
      if (name === "cv" && filename) {
        cvFileName = filename;
      }
      file.on("data", (chunk) => {
        if (name === "cv" && chunk && chunk.length > 0) {
          cvUploaded = true;
        }
      });
      file.on("error", reject);
      file.resume();
    });

    bb.on("error", reject);
    bb.on("finish", () => resolve({ fields, cvUploaded, cvFileName }));

    req.pipe(bb);
  });
}

function esc(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendEmail({ to, subject, html, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error (${response.status}): ${details}`);
  }
}

function redirect(res, location) {
  res.statusCode = 303;
  res.setHeader("Location", location);
  res.end();
}

async function parseRequest(req) {
  const contentType = getHeader(req.headers, "content-type");

  if (contentType.includes("multipart/form-data")) {
    return parseMultipart(req);
  }

  const rawBuffer = await readRawBody(req);
  const rawText = rawBuffer.toString("utf8");

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return { fields: parseUrlEncoded(rawText), cvUploaded: false, cvFileName: "" };
  }

  if (contentType.includes("application/json")) {
    const json = rawText ? JSON.parse(rawText) : {};
    return { fields: json || {}, cvUploaded: false, cvFileName: "" };
  }

  throw new Error("unsupported_content_type");
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  if (!RESEND_API_KEY) {
    redirect(res, "/submit.html?error=email_not_configured");
    return;
  }

  try {
    const { fields, cvUploaded, cvFileName } = await parseRequest(req);

    if (fields.company_name) {
      redirect(res, "/thank-you.html");
      return;
    }

    const fullName = (fields.full_name || "").trim();
    const title = (fields.title || "").trim();
    const linkedin = (fields.linkedin || "").trim();
    const whatsapp = (fields.whatsapp || "").trim();
    const email = (fields.email || "").trim();
    const additional = (fields.additional || "").trim();
    const consent = String(fields.consent || "").trim().toLowerCase();

    if (!fullName || !title || !whatsapp || !email) {
      redirect(res, "/submit.html?error=missing_required_fields");
      return;
    }

    if (!linkedin && !cvUploaded) {
      redirect(res, "/submit.html?error=linkedin_or_cv_required");
      return;
    }

    if (!["on", "yes", "true", "1"].includes(consent)) {
      redirect(res, "/submit.html?error=consent_required");
      return;
    }

    const cvStatus = cvUploaded ? `Yes${cvFileName ? ` (${cvFileName})` : ""}` : "No";

    const adminSubject = `New Portfolio Request: ${fullName}`;
    const adminHtml = `
      <h2>New WebPortfolio Submission</h2>
      <p><strong>Full Name:</strong> ${esc(fullName)}</p>
      <p><strong>Professional Title:</strong> ${esc(title)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>WhatsApp:</strong> ${esc(whatsapp)}</p>
      <p><strong>LinkedIn URL:</strong> ${esc(linkedin || "Not provided")}</p>
      <p><strong>CV Uploaded:</strong> ${esc(cvStatus)}</p>
      <p><strong>Additional Notes:</strong><br/>${esc(additional || "None")}</p>
      <p><strong>Service Price:</strong> Ksh 2,500</p>
    `;
    const adminText =
      `New WebPortfolio Submission\n\n` +
      `Full Name: ${fullName}\n` +
      `Professional Title: ${title}\n` +
      `Email: ${email}\n` +
      `WhatsApp: ${whatsapp}\n` +
      `LinkedIn URL: ${linkedin || "Not provided"}\n` +
      `CV Uploaded: ${cvStatus}\n` +
      `Additional Notes: ${additional || "None"}\n` +
      `Service Price: Ksh 2,500\n`;

    const userSubject = "We received your portfolio request - WebPortfolio Kenya";
    const userHtml = `
      <h2>Thank you, ${esc(fullName)}.</h2>
      <p>We have received your portfolio request and will contact you shortly on WhatsApp.</p>
      <p><strong>What happens next:</strong></p>
      <ul>
        <li>We review your LinkedIn/CV details.</li>
        <li>We contact you on WhatsApp for any quick clarifications.</li>
        <li>We build your professional portfolio.</li>
        <li>We send your live portfolio URL.</li>
      </ul>
      <p><strong>Service fee:</strong> Ksh 2,500</p>
      <p>Thanks,<br/>WebPortfolio Kenya</p>
    `;
    const userText =
      `Thank you, ${fullName}.\n\n` +
      `We have received your portfolio request and will contact you shortly on WhatsApp.\n\n` +
      `What happens next:\n` +
      `- We review your LinkedIn/CV details.\n` +
      `- We contact you on WhatsApp for clarifications.\n` +
      `- We build your professional portfolio.\n` +
      `- We send your live portfolio URL.\n\n` +
      `Service fee: Ksh 2,500\n\n` +
      `WebPortfolio Kenya`;

    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: adminSubject,
        html: adminHtml,
        text: adminText,
      }),
      sendEmail({
        to: email,
        subject: userSubject,
        html: userHtml,
        text: userText,
      }),
    ]);

    redirect(res, "/thank-you.html");
  } catch (error) {
    if (String(error && error.message) === "unsupported_content_type") {
      redirect(res, "/submit.html?error=unsupported_content_type");
      return;
    }

    console.error("portfolio-submit failed:", error);
    redirect(res, "/submit.html?error=submission_failed");
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
