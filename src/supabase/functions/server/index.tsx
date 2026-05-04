import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as verificationStore from "./verification_store.tsx";
import * as notifications from "./notifications.tsx";

const app = new Hono();

// Initialize Supabase Storage bucket on startup
const initializeStorage = async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const bucketName = "make-fe4c8b06-verification-docs";

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log("Creating verification documents bucket...");
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.error("Error creating bucket:", error);
      } else {
        console.log("Verification documents bucket created successfully");
      }
    } else {
      console.log("Verification documents bucket already exists");
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

// Initialize storage on startup
initializeStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Explicit OPTIONS handler for all routes
app.options("*", (c) => {
  return c.text("", 204);
});

// Health check endpoint
app.get("/make-server-fe4c8b06/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-fe4c8b06/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, businessName, userType } = body;

    if (!email || !password || !userType) {
      return c.json({ error: "Missing required fields: email, password, userType" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        userType: userType,
        fullName: fullName || null,
        businessName: businessName || null,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error("Error creating user during signup:", error);
      
      // Handle duplicate email error with a user-friendly message
      if (error.message?.includes("already been registered") || error.code === "email_exists") {
        return c.json({ 
          error: "An account with this email already exists. Please sign in instead." 
        }, 400);
      }
      
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    await kv.set(`user:${data.user.id}`, {
      userId: data.user.id,
      email: email,
      userType: userType,
      fullName: fullName || null,
      businessName: businessName || null,
      createdAt: new Date().toISOString(),
    });

    // After creating user, sign them in to get an access token
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (sessionError || !sessionData.session) {
      console.error("Error creating session after signup:", sessionError);
      // Still return success, user can log in manually
      return c.json({
        success: true,
        userId: data.user.id,
        userType: userType,
      });
    }

    return c.json({
      success: true,
      userId: data.user.id,
      userType: userType,
      accessToken: sessionData.session.access_token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Sign in endpoint
app.post("/make-server-fe4c8b06/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Missing required fields: email, password" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error signing in user:", error);
      return c.json({ error: error.message }, 401);
    }

    if (!data.session || !data.user) {
      return c.json({ error: "Failed to create session" }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      userId: data.user.id,
      userType: userData?.userType || data.user.user_metadata?.userType || "earner",
      email: data.user.email,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return c.json({ error: "Internal server error during sign in" }, 500);
  }
});

// Reset password endpoint
app.post("/make-server-fe4c8b06/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email, newPassword } = body;

    console.log("=== PASSWORD RESET REQUEST ===");
    console.log("Email:", email);
    console.log("Password length:", newPassword?.length);

    if (!email || !newPassword) {
      console.log("Missing required fields");
      return c.json({ error: "Missing required fields: email, newPassword" }, 400);
    }

    if (newPassword.length < 8) {
      console.log("Password too short");
      return c.json({ error: "Password must be at least 8 characters long" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Supabase URL:", supabaseUrl);
    console.log("Service key exists:", !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return c.json({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Attempting to list users...");

    // Get user by email - try with filter parameter
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      console.error("Error code:", listError.code);
      console.error("Error message:", listError.message);
      console.error("Error status:", listError.status);
      return c.json({ error: `Failed to list users: ${listError.message}` }, 500);
    }

    console.log("Users list retrieved, count:", listData?.users?.length || 0);

    if (!listData || !listData.users) {
      console.error("Invalid response from listUsers");
      return c.json({ error: "Invalid response from user service" }, 500);
    }

    const user = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log("User not found for email:", email);
      console.log("Available emails:", listData.users.map(u => u.email).join(", "));
      return c.json({ error: "No account found with this email address. Please sign up first." }, 404);
    }

    console.log("User found, ID:", user.id);
    console.log("Attempting to update password...");

    // Update the user's password
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      console.error("Update error code:", updateError.code);
      console.error("Update error message:", updateError.message);
      return c.json({ error: `Failed to update password: ${updateError.message}` }, 500);
    }

    console.log("Password updated successfully for user:", user.id);

    return c.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("=== PASSWORD RESET EXCEPTION ===");
    console.error("Error:", error);
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return c.json({ 
      error: `Server error: ${error instanceof Error ? error.message : String(error)}` 
    }, 500);
  }
});

// Get session endpoint
app.get("/make-server-fe4c8b06/session", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);

    return c.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
      userType: userData?.userType || data.user.user_metadata?.userType || "earner",
    });
  } catch (error) {
    console.error("Session check error:", error);
    return c.json({ error: "Internal server error checking session" }, 500);
  }
});

// Sign out endpoint
app.post("/make-server-fe4c8b06/signout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return c.json({ error: "Internal server error during sign out" }, 500);
  }
});

// Submit earner verification
app.post("/make-server-fe4c8b06/verification/earner", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const formData = await c.req.formData();
    const phoneNumber = formData.get("phoneNumber") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const address = formData.get("address") as string;
    const governmentId = formData.get("governmentId") as File;
    const proofOfAddress = formData.get("proofOfAddress") as File;

    if (!phoneNumber || !dateOfBirth || !address || !governmentId || !proofOfAddress) {
      return c.json({ error: "Missing required fields or files" }, 400);
    }

    const bucketName = "make-fe4c8b06-verification-docs";
    const uploadedFiles: Record<string, string> = {};

    // Upload files to Supabase Storage
    const filesToUpload = [
      { key: "governmentId", file: governmentId },
      { key: "proofOfAddress", file: proofOfAddress },
    ];

    for (const { key, file } of filesToUpload) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/earner/${key}.${fileExt}`;
      
      const fileBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Error uploading ${key}:`, uploadError);
        return c.json({ error: `Failed to upload ${key}` }, 500);
      }

      // Generate signed URL (valid for 1 year)
      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 31536000);

      if (signedUrlData?.signedUrl) {
        uploadedFiles[key] = signedUrlData.signedUrl;
      }
    }

    // Store verification data using dedicated verification store
    await verificationStore.saveEarnerVerification(user.id, {
      phoneNumber,
      dateOfBirth,
      address,
      documents: {
        governmentId: uploadedFiles.governmentId,
        proofOfAddress: uploadedFiles.proofOfAddress,
      },
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,
    });

    // 🔔 TRIGGER: Notify admin of new verification submission
    const userData = await kv.get(`user:${user.id}`);
    const userName = userData?.fullName || user.email || "Unknown User";
    await notifications.triggerVerificationSubmitted(user.id, userName, "earner");

    return c.json({
      success: true,
      status: "pending",
      message: "Verification documents submitted successfully",
    });
  } catch (error) {
    console.error("Earner verification error:", error);
    return c.json({ error: "Internal server error during verification submission" }, 500);
  }
});

// Submit advertiser verification
app.post("/make-server-fe4c8b06/verification/advertiser", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const formData = await c.req.formData();
    const businessAddress = formData.get("businessAddress") as string;
    const taxId = formData.get("taxId") as string;
    const websiteUrl = formData.get("websiteUrl") as string;
    const businessLicense = formData.get("businessLicense") as File;
    const taxDocument = formData.get("taxDocument") as File;
    const proofOfAddress = formData.get("proofOfAddress") as File;
    const ownershipDocument = formData.get("ownershipDocument") as File;

    if (!businessAddress || !taxId || !businessLicense || !taxDocument || !proofOfAddress || !ownershipDocument) {
      return c.json({ error: "Missing required fields or files" }, 400);
    }

    const bucketName = "make-fe4c8b06-verification-docs";
    const uploadedFiles: Record<string, string> = {};

    // Upload files to Supabase Storage
    const filesToUpload = [
      { key: "businessLicense", file: businessLicense },
      { key: "taxDocument", file: taxDocument },
      { key: "proofOfAddress", file: proofOfAddress },
      { key: "ownershipDocument", file: ownershipDocument },
    ];

    for (const { key, file } of filesToUpload) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/advertiser/${key}.${fileExt}`;
      
      const fileBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Error uploading ${key}:`, uploadError);
        return c.json({ error: `Failed to upload ${key}` }, 500);
      }

      // Generate signed URL (valid for 1 year)
      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 31536000);

      if (signedUrlData?.signedUrl) {
        uploadedFiles[key] = signedUrlData.signedUrl;
      }
    }

    // Store verification data using dedicated verification store
    await verificationStore.saveAdvertiserVerification(user.id, {
      businessAddress,
      taxId,
      websiteUrl: websiteUrl || null,
      documents: {
        businessLicense: uploadedFiles.businessLicense,
        taxDocument: uploadedFiles.taxDocument,
        proofOfAddress: uploadedFiles.proofOfAddress,
        ownershipDocument: uploadedFiles.ownershipDocument,
      },
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,
    });

    // 🔔 TRIGGER: Notify admin of new verification submission
    const userData = await kv.get(`user:${user.id}`);
    const businessName = userData?.businessName || user.email || "Unknown Business";
    await notifications.triggerVerificationSubmitted(user.id, businessName, "advertiser");

    return c.json({
      success: true,
      status: "pending",
      message: "Verification documents submitted successfully",
    });
  } catch (error) {
    console.error("Advertiser verification error:", error);
    return c.json({ error: "Internal server error during verification submission" }, 500);
  }
});

// Get verification status
app.get("/make-server-fe4c8b06/verification/status", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Get user type from KV store
    const userData = await kv.get(`user:${user.id}`);
    const userType = (userData?.userType || "earner") as "earner" | "advertiser";

    // Get verification data using dedicated verification store
    const verificationData = await verificationStore.getVerification(user.id, userType);

    if (!verificationData) {
      return c.json({
        success: true,
        status: "not_submitted",
        verificationData: null,
      });
    }

    return c.json({
      success: true,
      status: verificationData.status,
      verificationData: {
        submittedAt: verificationData.submittedAt,
        reviewedAt: verificationData.reviewedAt,
        reviewNotes: verificationData.reviewNotes,
      },
    });
  } catch (error) {
    console.error("Verification status check error:", error);
    return c.json({ error: "Internal server error checking verification status" }, 500);
  }
});

// Create campaign (Advertiser)
app.post("/make-server-fe4c8b06/campaigns", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const body = await c.req.json();
    const { name, url, reward, expiresAt, description, location } = body;

    if (!name || !url || !reward) {
      return c.json({ error: "Missing required fields: name, url, reward" }, 400);
    }

    // Get user data
    const userData = await kv.get(`user:${user.id}`);
    
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const campaign = {
      id: campaignId,
      advertiserId: user.id,
      advertiserName: userData?.businessName || userData?.fullName || user.email,
      name,
      url,
      reward: parseFloat(reward),
      expiresAt,
      description: description || "",
      location: location || "",
      scans: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Save to KV store
    await kv.set(`campaign:${campaignId}`, campaign);
    
    // Also add to user's campaign list
    const userCampaigns = await kv.get(`user:${user.id}:campaigns`) || [];
    userCampaigns.push(campaignId);
    await kv.set(`user:${user.id}:campaigns`, userCampaigns);

    return c.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return c.json({ error: "Internal server error creating campaign" }, 500);
  }
});

// Get campaigns (with optional filtering)
app.get("/make-server-fe4c8b06/campaigns", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const advertiserId = c.req.query("advertiserId");
    
    // Optional auth for filtering by user
    let userId = null;
    if (accessToken) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      userId = user?.id;
    }

    // Get all campaigns
    const allCampaigns = await kv.getByPrefix("campaign:");
    
    // Filter by advertiser if specified
    let campaigns = allCampaigns;
    if (advertiserId || userId) {
      const filterById = advertiserId || userId;
      campaigns = campaigns.filter((c: any) => c.advertiserId === filterById);
    }

    // Sort by creation date (newest first)
    campaigns.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return c.json({ error: "Internal server error fetching campaigns" }, 500);
  }
});

// Update campaign status
app.patch("/make-server-fe4c8b06/campaigns/:id/status", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const campaignId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!status || !["active", "paused", "ended"].includes(status)) {
      return c.json({ error: "Invalid status. Must be: active, paused, or ended" }, 400);
    }

    const campaign = await kv.get(`campaign:${campaignId}`);
    
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Update campaign
    campaign.status = status;
    await kv.set(`campaign:${campaignId}`, campaign);

    return c.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Update campaign status error:", error);
    return c.json({ error: "Internal server error updating campaign" }, 500);
  }
});

// Record QR scan
app.post("/make-server-fe4c8b06/campaigns/:id/scan", async (c) => {
  try {
    const campaignId = c.req.param("id");
    
    const campaign = await kv.get(`campaign:${campaignId}`);
    
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Increment scan count
    campaign.scans = (campaign.scans || 0) + 1;
    await kv.set(`campaign:${campaignId}`, campaign);

    return c.json({
      success: true,
      scans: campaign.scans,
    });
  } catch (error) {
    console.error("Record scan error:", error);
    return c.json({ error: "Internal server error recording scan" }, 500);
  }
});

// Admin: Get all verifications
app.get("/make-server-fe4c8b06/admin/verifications", async (c) => {
  try {
    // Get all verifications for both earners and advertisers
    const earnerVerifications = await kv.getByPrefix("verification:earner:");
    const advertiserVerifications = await kv.getByPrefix("verification:advertiser:");
    
    // Format verification data with user info
    const formatVerifications = async (verifications: any[], type: "earner" | "advertiser") => {
      const formatted = [];
      
      for (const verification of verifications) {
        const userId = verification.userId;
        const userData = await kv.get(`user:${userId}`);
        
        formatted.push({
          id: `${type}_${userId}`,
          userId,
          userName: userData?.fullName || userData?.businessName || userData?.email || "Unknown",
          userEmail: userData?.email || "Unknown",
          userType: type,
          status: verification.status,
          submittedAt: verification.submittedAt,
          reviewedAt: verification.reviewedAt,
          reviewNotes: verification.reviewNotes,
          data: verification,
        });
      }
      
      return formatted;
    };
    
    const earnerList = await formatVerifications(earnerVerifications, "earner");
    const advertiserList = await formatVerifications(advertiserVerifications, "advertiser");
    
    const allVerifications = [...earnerList, ...advertiserList];
    
    // Sort by submission date (newest first)
    allVerifications.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json({
      success: true,
      verifications: allVerifications,
    });
  } catch (error) {
    console.error("Get admin verifications error:", error);
    return c.json({ error: "Internal server error fetching verifications" }, 500);
  }
});

// Admin: Update verification status
app.patch("/make-server-fe4c8b06/admin/verifications/:id/status", async (c) => {
  try {
    const verificationId = c.req.param("id");
    
    console.log("=== UPDATE VERIFICATION STATUS ===");
    console.log("Verification ID:", verificationId);
    
    const body = await c.req.json();
    const { status, notes } = body;

    console.log("Status:", status);
    console.log("Notes:", notes);

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      console.log("Invalid status provided");
      return c.json({ error: "Invalid status. Must be: pending, approved, or rejected" }, 400);
    }

    // Parse verification ID (format: earner_userId or advertiser_userId)
    const parts = verificationId.split("_");
    const userType = parts[0];
    const userId = parts.slice(1).join("_"); // Handle user IDs that might contain underscores
    
    console.log("User type:", userType);
    console.log("User ID:", userId);
    
    if (!userType || !userId || !["earner", "advertiser"].includes(userType)) {
      console.log("Invalid verification ID format");
      return c.json({ error: "Invalid verification ID format" }, 400);
    }

    const verification = await verificationStore.getVerification(userId, userType as "earner" | "advertiser");
    
    console.log("Verification found:", !!verification);
    
    if (!verification) {
      return c.json({ error: "Verification not found" }, 404);
    }

    // Update verification
    verification.status = status;
    verification.reviewedAt = new Date().toISOString();
    verification.reviewNotes = notes || null;

    // Save back
    if (userType === "earner") {
      await verificationStore.saveEarnerVerification(userId, verification);
    } else {
      await verificationStore.saveAdvertiserVerification(userId, verification);
    }

    console.log("Verification updated successfully");

    return c.json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error("Update verification status error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return c.json({ error: `Internal server error updating verification: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});

// Admin: Get analytics
app.get("/make-server-fe4c8b06/admin/analytics", async (c) => {
  try {
    // Get all data
    const campaigns = await kv.getByPrefix("campaign:");
    const users = await kv.getByPrefix("user:");
    const earnerVerifications = await kv.getByPrefix("verification:earner:");
    const advertiserVerifications = await kv.getByPrefix("verification:advertiser:");
    
    // Calculate stats
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c: any) => c.status === "active").length;
    const totalScans = campaigns.reduce((sum: number, c: any) => sum + (c.scans || 0), 0);
    const totalRevenue = campaigns.reduce((sum: number, c: any) => 
      sum + ((c.scans || 0) * (c.reward || 0)), 0
    );
    
    const totalUsers = users.filter((u: any) => u.userId).length;
    const earnerCount = users.filter((u: any) => u.userType === "earner").length;
    const advertiserCount = users.filter((u: any) => u.userType === "advertiser").length;
    
    const totalVerifications = earnerVerifications.length + advertiserVerifications.length;
    const pendingVerifications = [...earnerVerifications, ...advertiserVerifications]
      .filter((v: any) => v.status === "pending").length;

    return c.json({
      success: true,
      analytics: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          totalScans,
        },
        users: {
          total: totalUsers,
          earners: earnerCount,
          advertisers: advertiserCount,
        },
        verifications: {
          total: totalVerifications,
          pending: pendingVerifications,
        },
        revenue: {
          totalPaidOut: totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Get admin analytics error:", error);
    return c.json({ error: "Internal server error fetching analytics" }, 500);
  }
});

Deno.serve(app.fetch);