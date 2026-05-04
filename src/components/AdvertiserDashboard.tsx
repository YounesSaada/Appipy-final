import { useState, useEffect } from "react";
import { BarChart3, Upload, Download, Eye, Users, TrendingUp, Calendar, MapPin, X, LogOut, Plus } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const campaignData = [
  { day: "Mon", scans: 45 },
  { day: "Tue", scans: 62 },
  { day: "Wed", scans: 55 },
  { day: "Thu", scans: 78 },
  { day: "Fri", scans: 85 },
  { day: "Sat", scans: 92 },
  { day: "Sun", scans: 68 },
];

const locationBreakdown = [
  { location: "Downtown", scans: 156, percentage: 32 },
  { location: "Midtown", scans: 134, percentage: 28 },
  { location: "Westside", scans: 98, percentage: 20 },
  { location: "Atwater", scans: 97, percentage: 20 },
];

const activeCampaign = {
  name: "Holiday Special - 20% Off",
  status: "Active",
  startDate: "Dec 1, 2025",
  endDate: "Dec 31, 2025",
  totalScans: 485,
  uniqueScans: 312,
  budget: "$500",
  spent: "$242.50",
  creativeName: "holiday-promo.jpg",
};

export function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    url: "",
    reward: "0.50",
    description: "",
    location: "",
    expiresAt: "",
  });
  
  const tabs = ["Overview", "My Campaigns", "Create Campaign", "Reports"];

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const accessToken = localStorage.getItem("appipy_access_token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.url || !newCampaign.reward) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("appipy_access_token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/campaigns`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(newCampaign),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Campaign created successfully!");
        // Reset form
        setNewCampaign({
          name: "",
          url: "",
          reward: "0.50",
          description: "",
          location: "",
          expiresAt: "",
        });
        // Refresh campaigns list
        fetchCampaigns();
        // Switch to My Campaigns tab
        setActiveTab("My Campaigns");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const accessToken = localStorage.getItem("appipy_access_token");
      if (accessToken) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });
      }
      localStorage.removeItem("appipy_access_token");
      localStorage.removeItem("appipy_user_type");
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
      // Still reload to return to home page
      window.location.reload();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadReport = () => {
    const reportData = {
      campaignName: activeCampaign.name,
      reportDate: new Date().toLocaleDateString(),
      totalScans: activeCampaign.totalScans,
      uniqueScans: activeCampaign.uniqueScans,
      budgetSpent: activeCampaign.spent,
      dailyBreakdown: campaignData,
      locationBreakdown: locationBreakdown,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `appipy-report-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 border-0 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl mb-1">{activeCampaign.totalScans}</div>
          <div className="text-sm text-blue-200">Total Scans</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-700 border-0 text-white">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl mb-1">{activeCampaign.uniqueScans}</div>
          <div className="text-sm text-slate-200">Unique Scans</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-700 to-green-600 border-0 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl mb-1">64%</div>
          <div className="text-sm text-green-200">Unique Rate</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-500 border-0 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl mb-1">{activeCampaign.spent}</div>
          <div className="text-sm text-yellow-200">Total Spent</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-slate-900 mb-6">Daily Scans (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="scans" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-slate-900 mb-6">Scan Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#1e3a8a"
                strokeWidth={3}
                dot={{ fill: "#1e3a8a", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Location Breakdown */}
      <Card className="p-6 bg-white border-slate-200">
        <h3 className="text-slate-900 mb-6">Scans by Location</h3>
        <div className="space-y-4">
          {locationBreakdown.map((location, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-700" />
                  <span className="text-slate-900">{location.location}</span>
                </div>
                <span className="text-slate-600">{location.scans} scans ({location.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-700 h-2 rounded-full transition-all"
                  style={{ width: `${location.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderActiveCampaign = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-blue-900 border-0 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-blue-200 mb-1">ACTIVE CAMPAIGN</div>
            <h2 className="text-2xl">{activeCampaign.name}</h2>
          </div>
          <div className="px-4 py-2 bg-green-500 rounded-full text-sm">
            {activeCampaign.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-blue-200 mb-1">Start Date</div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{activeCampaign.startDate}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-200 mb-1">End Date</div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{activeCampaign.endDate}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-200 mb-1">Creative</div>
            <div>{activeCampaign.creativeName}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-slate-900 mb-6">Campaign Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-slate-600">Total Scans</span>
              <span className="text-2xl text-slate-900">{activeCampaign.totalScans}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-slate-600">Unique Scans</span>
              <span className="text-2xl text-slate-900">{activeCampaign.uniqueScans}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-slate-600">Cost per Scan</span>
              <span className="text-2xl text-slate-900">$0.50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Avg. Daily Scans</span>
              <span className="text-2xl text-slate-900">69</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-slate-900 mb-6">Budget Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Total Budget</span>
                <span className="text-slate-900">{activeCampaign.budget}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Spent</span>
                <span className="text-blue-700">{activeCampaign.spent}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-1">
                <div
                  className="bg-blue-700 h-3 rounded-full transition-all"
                  style={{ width: "48.5%" }}
                ></div>
              </div>
              <div className="text-sm text-slate-500">48.5% of budget used</div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Remaining Budget</span>
                <span className="text-2xl text-green-600">$257.50</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white border-slate-200">
        <h3 className="text-slate-900 mb-6">Daily Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaignData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="scans" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderUploadCreative = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white border-slate-200">
        <div className="text-center mb-8">
          <Upload className="h-16 w-16 mx-auto mb-4 text-blue-700" />
          <h2 className="text-2xl text-slate-900 mb-2">Upload Campaign Creative</h2>
          <p className="text-slate-600">Upload your promotional image or QR code design</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="campaignName" className="text-slate-700">Campaign Name</Label>
            <Input
              id="campaignName"
              placeholder="e.g., Summer Sale 2025"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="creative" className="text-slate-700">Upload Creative</Label>
            <div className="mt-2">
              <label
                htmlFor="creative"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {uploadedFile ? (
                  <div className="relative w-full h-full p-4">
                    <img
                      src={uploadedFile}
                      alt="Preview"
                      className="w-full h-full object-contain rounded"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadedFile(null);
                        setFileName("");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-12 w-12 mb-4 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG, or SVG (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  id="creative"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
              {fileName && (
                <p className="mt-2 text-sm text-slate-600">Selected: {fileName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-slate-700">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-slate-700">End Date</Label>
              <Input
                id="endDate"
                type="date"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="budget" className="text-slate-700">Campaign Budget</Label>
            <Input
              id="budget"
              type="number"
              placeholder="$500"
              className="mt-2"
            />
          </div>

          <Button
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900"
            disabled={!uploadedFile}
          >
            Launch Campaign
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-slate-900 mb-2">Campaign Reports</h2>
            <p className="text-slate-600">Download detailed analytics for your campaigns</p>
          </div>
          <Download className="h-8 w-8 text-blue-700" />
        </div>

        <div className="space-y-4">
          <Card className="p-6 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-slate-900 mb-1">Current Campaign Report</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Detailed analytics for "{activeCampaign.name}"
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                  <div>
                    <span className="text-slate-500">Total Scans:</span> {activeCampaign.totalScans}
                  </div>
                  <div>
                    <span className="text-slate-500">Unique Scans:</span> {activeCampaign.uniqueScans}
                  </div>
                  <div>
                    <span className="text-slate-500">Spent:</span> {activeCampaign.spent}
                  </div>
                </div>
              </div>
              <Button
                onClick={downloadReport}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-slate-900 mb-4">Report Includes:</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="text-blue-700 mr-2">✓</span>
                Daily scan breakdown with detailed metrics
              </li>
              <li className="flex items-start">
                <span className="text-blue-700 mr-2">✓</span>
                Geographic distribution of scans by location
              </li>
              <li className="flex items-start">
                <span className="text-blue-700 mr-2">✓</span>
                Unique vs. total scan comparison
              </li>
              <li className="flex items-start">
                <span className="text-blue-700 mr-2">✓</span>
                Budget utilization and cost per scan analysis
              </li>
              <li className="flex items-start">
                <span className="text-blue-700 mr-2">✓</span>
                Campaign performance trends
              </li>
            </ul>
          </Card>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-slate-900 mb-2">Need Custom Reports?</h3>
        <p className="text-slate-700 mb-4">
          Contact our support team for customized analytics and insights tailored to your business needs.
        </p>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white">
          Contact Support
        </Button>
      </Card>
    </div>
  );

  const renderMyCampaigns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900">My Campaigns</h2>
          <p className="text-slate-600">View and manage all your campaigns</p>
        </div>
        <Button
          onClick={() => setActiveTab("Create Campaign")}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-12 bg-white border-slate-200">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl text-slate-900 mb-2">No campaigns yet</h3>
            <p className="text-slate-600 mb-6">Create your first campaign to start tracking scans and engagement</p>
            <Button
              onClick={() => setActiveTab("Create Campaign")}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 bg-white border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{campaign.description || "No description"}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  campaign.status === "active"
                    ? "bg-green-100 text-green-700"
                    : campaign.status === "paused"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {campaign.status}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Scans:</span>
                  <span className="font-semibold text-blue-700">{campaign.scans || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Reward per Scan:</span>
                  <span className="font-semibold text-green-600">${campaign.reward.toFixed(2)}</span>
                </div>
                {campaign.location && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Location:</span>
                    <span className="text-slate-900">{campaign.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Created:</span>
                  <span className="text-slate-900">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Campaign URL:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={campaign.url}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(campaign.url);
                      alert("URL copied to clipboard!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateCampaign = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-8">
          <h2 className="text-2xl text-slate-900 mb-2">Create New Campaign</h2>
          <p className="text-slate-600">Fill in the details to launch your QR campaign</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-slate-700 font-medium">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Summer Sale 2026"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="url" className="text-slate-700 font-medium">Target URL *</Label>
            <Input
              id="url"
              placeholder="https://yourbusiness.com/promo"
              value={newCampaign.url}
              onChange={(e) => setNewCampaign({ ...newCampaign, url: e.target.value })}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">Where users will be redirected when they scan the QR code</p>
          </div>

          <div>
            <Label htmlFor="reward" className="text-slate-700 font-medium">Reward per Scan ($) *</Label>
            <Input
              id="reward"
              type="number"
              step="0.25"
              placeholder="0.50"
              value={newCampaign.reward}
              onChange={(e) => setNewCampaign({ ...newCampaign, reward: e.target.value })}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">How much earners will receive for each scan</p>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
              className="mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-slate-700 font-medium">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Downtown Los Angeles"
              value={newCampaign.location}
              onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="expiresAt" className="text-slate-700 font-medium">Expiration Date</Label>
            <Input
              id="expiresAt"
              type="date"
              value={newCampaign.expiresAt}
              onChange={(e) => setNewCampaign({ ...newCampaign, expiresAt: e.target.value })}
              className="mt-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCreateCampaign}
              disabled={loading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold"
            >
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
            <Button
              onClick={() => setActiveTab("My Campaigns")}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">Advertiser Dashboard</h1>
              <p className="text-blue-200">Manage your campaigns and track performance</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center space-x-2 border-white text-white hover:bg-white hover:text-blue-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-white text-blue-900"
                    : "bg-blue-800/50 text-white hover:bg-blue-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "Overview" && renderOverview()}
        {activeTab === "Active Campaign" && renderActiveCampaign()}
        {activeTab === "Upload Creative" && renderUploadCreative()}
        {activeTab === "Reports" && renderReports()}
        {activeTab === "My Campaigns" && renderMyCampaigns()}
        {activeTab === "Create Campaign" && renderCreateCampaign()}
      </div>
    </div>
  );
}