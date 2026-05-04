import * as kv from "./kv_store.tsx";

// Admin email for notifications
const ADMIN_EMAIL = "ys.saada12@gmail.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_JDToLSdY_3pSyQhAJKWRpbiwrf7gDiPgh";

export interface Notification {
  id: string;
  type: "verification_submitted" | "verification_approved" | "verification_rejected" | "campaign_created";
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

// Create a notification
export async function createNotification(
  type: Notification["type"],
  title: string,
  message: string,
  data: any = {}
): Promise<void> {
  const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const notification: Notification = {
    id: notificationId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`notification:${notificationId}`, notification);
  
  console.log(`✅ Notification created: ${type} - ${title}`);
}

// Get all notifications
export async function getAllNotifications(): Promise<Notification[]> {
  const notifications = await kv.getByPrefix("notification:");
  
  // Sort by creation date (newest first)
  notifications.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return notifications;
}

// Get unread notifications
export async function getUnreadNotifications(): Promise<Notification[]> {
  const notifications = await getAllNotifications();
  return notifications.filter((n: Notification) => !n.read);
}

// Mark notification as read
export async function markAsRead(notificationId: string): Promise<void> {
  const notification = await kv.get(`notification:${notificationId}`);
  
  if (notification) {
    notification.read = true;
    await kv.set(`notification:${notificationId}`, notification);
  }
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<void> {
  const notifications = await getAllNotifications();
  
  for (const notification of notifications) {
    if (!notification.read) {
      notification.read = true;
      await kv.set(`notification:${notification.id}`, notification);
    }
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<void> {
  await kv.del(`notification:${notificationId}`);
}

// Send email via Resend
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not configured. Email not sent.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Appipy Admin <onboarding@resend.dev>", // Use your verified domain later
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Email send failed:", error);
    } else {
      console.log("✅ Email sent successfully to:", to);
    }
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

// Trigger: Verification submitted
export async function triggerVerificationSubmitted(
  userId: string,
  userName: string,
  userType: "earner" | "advertiser"
): Promise<void> {
  const title = `New ${userType} verification request`;
  const message = `${userName} has submitted their verification documents and is awaiting review.`;
  
  await createNotification(
    "verification_submitted",
    title,
    message,
    { userId, userName, userType }
  );

  // 📧 Send email notification
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; padding: 8px 16px; background: #facc15; color: #1e3a8a; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
          .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #facc15; }
          .button { display: inline-block; padding: 12px 30px; background: #facc15; color: #1e3a8a; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔔 Appipy Admin Alert</h1>
          </div>
          <div class="content">
            <div class="badge">${userType.toUpperCase()}</div>
            <h2 style="color: #1e3a8a; margin-top: 10px;">${title}</h2>
            <div class="info">
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Type:</strong> ${userType === "earner" ? "Earner" : "Advertiser"}</p>
              <p><strong>Status:</strong> Pending Review</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>${message}</p>
            <p><strong>Action Required:</strong> Please log in to the admin dashboard to review and approve/reject this verification request.</p>
            <a href="${Deno.env.get("APP_URL") || "https://your-app-url.com"}/admin" class="button">
              Review Verification →
            </a>
          </div>
          <div class="footer">
            <p>Appipy Admin Notifications</p>
            <p>This is an automated notification. Do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(ADMIN_EMAIL, `🔔 ${title}`, emailHtml);
}

// Trigger: Verification approved
export async function triggerVerificationApproved(
  userId: string,
  userName: string,
  userType: "earner" | "advertiser"
): Promise<void> {
  await createNotification(
    "verification_approved",
    `${userType} verification approved`,
    `${userName}'s verification has been approved.`,
    { userId, userName, userType }
  );
}

// Trigger: Verification rejected
export async function triggerVerificationRejected(
  userId: string,
  userName: string,
  userType: "earner" | "advertiser"
): Promise<void> {
  await createNotification(
    "verification_rejected",
    `${userType} verification rejected`,
    `${userName}'s verification has been rejected.`,
    { userId, userName, userType }
  );
}

// Trigger: Campaign created
export async function triggerCampaignCreated(
  campaignId: string,
  campaignName: string,
  advertiserName: string
): Promise<void> {
  await createNotification(
    "campaign_created",
    "New campaign created",
    `${advertiserName} created a new campaign: "${campaignName}"`,
    { campaignId, campaignName, advertiserName }
  );
}