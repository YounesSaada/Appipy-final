import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Shield,
  QrCode,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Copy,
  Search,
  LogOut,
  BarChart3,
  Activity,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import hero1 from "../assets/hero1.png";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface QRCampaign {
  id: string;
  name: string;
  advertiserName: string;
  url: string;
  scans: number;
  status: "active" | "paused" | "ended";
  createdAt: string;
  expiresAt: string;
  reward: number;
}

interface VerificationRequest {
  id: string;
  userName: string;
  userType: "earner" | "advertiser";
  email: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // QR Code Generator State
  const [qrName, setQrName] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrAdvertiser, setQrAdvertiser] = useState("");
  const [qrReward, setQrReward] = useState("0.50");
  const [qrExpiry, setQrExpiry] = useState("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Real data from backend
  const [campaigns, setCampaigns] = useState<QRCampaign[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEarners: 0,
    activeAdvertisers: 0,
    totalScans: 0,
    totalPayout: 0,
    activeCampaigns: 0,
    pendingVerifications: 0,
  });

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/admin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats({
          totalUsers: data.analytics.users.total,
          activeEarners: data.analytics.users.earners,
          activeAdvertisers: data.analytics.users.advertisers,
          totalScans: data.analytics.campaigns.totalScans,
          totalPayout: data.analytics.revenue.totalPaidOut,
          activeCampaigns: data.analytics.campaigns.active,
          pendingVerifications: data.analytics.verifications.pending,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  // Fetch verifications
  const fetchVerifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/admin/verifications`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setVerifications(data.verifications);
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchAnalytics();
    fetchCampaigns();
    fetchVerifications();
  }, []);

  const handleGenerateQR = () => {
    if (!qrName || !qrUrl || !qrAdvertiser) {
      alert("Please fill in all required fields");
      return;
    }

    const campaignId = `QR${String(campaigns.length + 1).padStart(3, "0")}`;
    const newCampaign: QRCampaign = {
      id: campaignId,
      name: qrName,
      advertiserName: qrAdvertiser,
      url: qrUrl,
      scans: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: qrExpiry || "2026-12-31",
      reward: parseFloat(qrReward),
    };

    setCampaigns([newCampaign, ...campaigns]);
    
    // Generate QR code URL (using a QR code API)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
    setGeneratedQR(qrCodeUrl);

    // Reset form
    setQrName("");
    setQrUrl("");
    setQrAdvertiser("");
    setQrReward("0.50");
    setQrExpiry("");
  };

  const handleDownloadQR = () => {
    if (generatedQR) {
      const link = document.createElement("a");
      link.href = generatedQR;
      link.download = `${qrName || "qr-code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const handleVerificationAction = async (id: string, action: "approved" | "rejected") => {
    try {
      console.log("=== FRONTEND: Update Verification ===");
      console.log("Verification ID:", id);
      console.log("Action:", action);
      console.log("URL:", `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/admin/verifications/${id}/status`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/admin/verifications/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: action }),
        }
      );
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success) {
        // Update local state
        setVerifications(
          verifications.map((v) =>
            v.id === id ? { ...v, status: action } : v
          )
        );
        // Refresh analytics
        fetchAnalytics();
        alert(`Verification ${action} successfully!`);
      } else {
        console.error("Server returned error:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating verification:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      alert("Failed to update verification. Check console for details.");
    }
  };

  const handleCampaignStatus = async (id: string, status: "active" | "paused" | "ended") => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/campaigns/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      
      const data = await response.json();
      if (data.success) {
        // Update local state
        setCampaigns(
          campaigns.map((c) =>
            c.id === id ? { ...c, status } : c
          )
        );
        // Refresh analytics
        fetchAnalytics();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating campaign status:", error);
      alert("Failed to update campaign status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
      {/* Header */}
      <header className="bg-blue-950/80 backdrop-blur-sm border-b border-blue-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={hero1} alt="Appipy" className="h-10 w-auto" />
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-blue-900/80 border-blue-800 bg-[#f0f0f0]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="qr-engine" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
              <QrCode className="h-4 w-4 mr-2" />
              QR Engine
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
              <Activity className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
              <Users className="h-4 w-4 mr-2" />
              Verifications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm text-slate-600 mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">+12% this month</p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <QrCode className="h-6 w-6 text-purple-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm text-slate-600 mb-1">Total Scans</h3>
                <p className="text-3xl font-bold text-blue-900">{stats.totalScans.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">+28% this week</p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm text-slate-600 mb-1">Total Payout</h3>
                <p className="text-3xl font-bold text-blue-900">${stats.totalPayout.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">+18% this month</p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <Badge className="bg-yellow-400 text-blue-900">{stats.activeCampaigns}</Badge>
                </div>
                <h3 className="text-sm text-slate-600 mb-1">Active Campaigns</h3>
                <p className="text-3xl font-bold text-blue-900">{stats.activeCampaigns}</p>
                <p className="text-xs text-slate-500 mt-2">{stats.pendingVerifications} pending reviews</p>
              </Card>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-4">User Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700">Active Earners</span>
                      <span className="text-blue-900 font-semibold">{stats.activeEarners.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${(stats.activeEarners / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700">Active Advertisers</span>
                      <span className="text-blue-900 font-semibold">{stats.activeAdvertisers.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full" 
                        style={{ width: `${(stats.activeAdvertisers / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">New campaign approved</p>
                      <p className="text-xs text-slate-600">Pizza Palace Special - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">New user signup</p>
                      <p className="text-xs text-slate-600">142 new earners today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Scan milestone reached</p>
                      <p className="text-xs text-slate-600">150K total scans - 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* QR Engine Tab */}
          <TabsContent value="qr-engine" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code Generator */}
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <QrCode className="h-6 w-6" />
                  QR Code Generator
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qr-name" className="text-blue-900 font-medium">
                      Campaign Name *
                    </Label>
                    <Input
                      id="qr-name"
                      placeholder="e.g., Summer Coffee Promo"
                      value={qrName}
                      onChange={(e) => setQrName(e.target.value)}
                      className="mt-2 bg-blue-50 border-blue-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qr-advertiser" className="text-blue-900 font-medium">
                      Advertiser Name *
                    </Label>
                    <Input
                      id="qr-advertiser"
                      placeholder="e.g., Java Junction"
                      value={qrAdvertiser}
                      onChange={(e) => setQrAdvertiser(e.target.value)}
                      className="mt-2 bg-blue-50 border-blue-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qr-url" className="text-blue-900 font-medium">
                      Target URL *
                    </Label>
                    <Input
                      id="qr-url"
                      placeholder="https://appipy.com/scan/..."
                      value={qrUrl}
                      onChange={(e) => setQrUrl(e.target.value)}
                      className="mt-2 bg-blue-50 border-blue-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qr-reward" className="text-blue-900 font-medium">
                      Reward Per Scan ($)
                    </Label>
                    <Input
                      id="qr-reward"
                      type="number"
                      step="0.25"
                      placeholder="0.50"
                      value={qrReward}
                      onChange={(e) => setQrReward(e.target.value)}
                      className="mt-2 bg-blue-50 border-blue-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qr-expiry" className="text-blue-900 font-medium">
                      Expiry Date
                    </Label>
                    <Input
                      id="qr-expiry"
                      type="date"
                      value={qrExpiry}
                      onChange={(e) => setQrExpiry(e.target.value)}
                      className="mt-2 bg-blue-50 border-blue-200"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateQR}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold py-6"
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </Card>

              {/* QR Code Preview */}
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">QR Code Preview</h3>

                {generatedQR ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-8 rounded-lg flex items-center justify-center">
                      <img
                        src={generatedQR}
                        alt="Generated QR Code"
                        className="w-64 h-64 border-4 border-white shadow-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-slate-600">Campaign Name</p>
                        <p className="text-sm font-semibold text-blue-900">{qrName || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-slate-600">Target URL</p>
                        <p className="text-sm font-semibold text-blue-900 truncate">{qrUrl || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleDownloadQR}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleCopyUrl(qrUrl)}
                        variant="outline"
                        className="flex-1 border-blue-300 text-blue-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-24 w-24 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500">No QR code generated yet</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Fill in the form and click Generate
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="p-6 bg-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-blue-900">All Campaigns</h3>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Advertiser</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Scans</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reward</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.advertiserName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((campaign) => (
                        <tr key={campaign.id} className="border-b border-slate-100 hover:bg-blue-50">
                          <td className="py-4 px-4 text-sm font-medium text-blue-900">{campaign.id}</td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
                              <p className="text-xs text-slate-500 truncate max-w-xs">{campaign.url}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-700">{campaign.advertiserName}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-purple-600">
                            {campaign.scans.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-green-600">
                            ${campaign.reward.toFixed(2)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={
                                campaign.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : campaign.status === "paused"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Select
                              value={campaign.status}
                              onValueChange={(value: "active" | "paused" | "ended") =>
                                handleCampaignStatus(campaign.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="ended">Ended</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-6">
            <Card className="p-6 bg-white border-0 shadow-lg">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Pending Verifications</h3>

              <div className="space-y-4">
                {verifications
                  .filter((v) => v.status === "pending")
                  .map((verification) => (
                    <Card key={verification.id} className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-lg">
                            {verification.userType === "earner" ? (
                              <Users className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Building2 className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900">{verification.userName}</p>
                            <p className="text-sm text-slate-600">{verification.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className={
                                  verification.userType === "earner"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }
                              >
                                {verification.userType}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                Submitted: {verification.submittedAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleVerificationAction(verification.id, "approved")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleVerificationAction(verification.id, "rejected")}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                {verifications.filter((v) => v.status === "pending").length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No pending verifications</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recently Processed */}
            <Card className="p-6 bg-white border-0 shadow-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Recently Processed</h3>
              <div className="space-y-3">
                {verifications
                  .filter((v) => v.status !== "pending")
                  .map((verification) => (
                    <div
                      key={verification.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {verification.status === "approved" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{verification.userName}</p>
                          <p className="text-xs text-slate-600">{verification.email}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          verification.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {verification.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}