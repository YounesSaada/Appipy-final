import { useState } from "react";
import { Menu, Check, MapPin, QrCode, Clock, MessageCircle, Mail, Phone, HelpCircle, FileText, Award, TrendingUp, Calendar, LogOut } from "lucide-react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const activityData = [
  { day: "S", value: 45 },
  { day: "M", value: 62 },
  { day: "T", value: 55 },
  { day: "W", value: 48 },
  { day: "T", value: 70 },
  { day: "F", value: 85 },
  { day: "S", value: 78 },
];

const weeklyActivityData = [
  { week: "Week 1", hours: 28, earnings: 210 },
  { week: "Week 2", hours: 32, earnings: 241 },
  { week: "Week 3", hours: 25, earnings: 188 },
  { week: "Week 4", hours: 30, earnings: 225 },
];

const tasks = [
  { id: 1, text: "Install headrest QR", completed: true, bonus: "$10" },
  { id: 2, text: "Install window QR", completed: true, bonus: "$10" },
  { id: 3, text: "Upload proof photo", completed: true, bonus: "$5" },
  { id: 4, text: "10 rides in campaign zone", completed: true, bonus: "$20" },
  { id: 5, text: "5 deliveries using branded bag", completed: false, bonus: "$15" },
  { id: 6, text: "Complete onboarding training", completed: true, bonus: "$25" },
  { id: 7, text: "Refer 3 new drivers", completed: false, bonus: "$50" },
];

const rankings = [
  { rank: 1, driver: "Driver #14", scans: 210 },
  { rank: 2, driver: "Driver #4", scans: 122 },
  { rank: 3, driver: "YOU", scans: 111, isUser: true },
];

const scanLocations = [
  { name: "Atwater", count: 7 },
  { name: "Downtown", count: 11 },
  { name: "Midtown", count: 5 },
  { name: "Westside", count: 8 },
];

const scanHistory = [
  { date: "Nov 28, 2025", time: "2:30 PM", location: "Downtown", scans: 4 },
  { date: "Nov 28, 2025", time: "11:15 AM", location: "Atwater", scans: 3 },
  { date: "Nov 27, 2025", time: "5:45 PM", location: "Midtown", scans: 5 },
  { date: "Nov 27, 2025", time: "1:20 PM", location: "Westside", scans: 2 },
  { date: "Nov 26, 2025", time: "3:10 PM", location: "Downtown", scans: 7 },
];

const faqItems = [
  {
    question: "How do I get paid?",
    answer: "Payments are processed every Friday via direct deposit to your linked bank account.",
  },
  {
    question: "What if my QR code gets damaged?",
    answer: "Contact support immediately and we'll ship you a replacement within 24 hours at no cost.",
  },
  {
    question: "How are scan bonuses calculated?",
    answer: "You earn $0.50 per unique QR scan. Bonuses increase with volume milestones.",
  },
];

export function EarnerDashboard() {
  const [activeTab, setActiveTab] = useState("My Earnings");
  const tabs = ["My Earnings", "Tasks", "Activity", "Scans", "Support"];

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

  const renderMyEarnings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tasks Section */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">TASKS</h3>
        <div className="space-y-4 mb-6">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  className="border-slate-300"
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className="text-slate-800 cursor-pointer"
                >
                  {task.text}
                </label>
              </div>
              {task.completed && (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </div>
          ))}
        </div>
        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6">
          Complete Tasks → Earn Bonuses
        </Button>
      </Card>

      {/* Activity Section */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">ACTIVITY</h3>
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                fill="url(#colorGradient)"
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl text-slate-900 mb-1">10</div>
            <div className="text-slate-500 text-sm">Rides Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl text-slate-900 mb-1">4h</div>
            <div className="text-slate-500 text-sm">Delivery Activity</div>
          </div>
          <div className="text-center">
            <div className="text-3xl text-slate-900 mb-1">2,340</div>
            <div className="text-slate-500 text-sm">Impressions Generated</div>
          </div>
        </div>
      </Card>

      {/* Scan Contribution Section */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">SCAN CONTRIBUTION</h3>
        <div className="flex items-start space-x-4">
          {/* Mock Map */}
          <div className="w-1/2 h-40 bg-slate-100 rounded-lg relative overflow-hidden">
            {/* Simple map representation */}
            <div className="absolute inset-0 opacity-20">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{ fill: "none", stroke: "#cbd5e1", strokeWidth: 2 }}
              >
                <path d="M0,50 L200,50 M0,100 L200,100 M0,150 L200,150" />
                <path d="M50,0 L50,200 M100,0 L100,200 M150,0 L150,200" />
              </svg>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className="w-8 h-8 text-blue-600 fill-blue-200" />
            </div>
          </div>
          {/* Location Stats */}
          <div className="flex-1 space-y-3">
            {scanLocations.slice(0, 2).map((location) => (
              <div
                key={location.name}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <span className="text-slate-800">{location.name}</span>
                <span className="text-slate-900 font-medium">
                  {location.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Driver Ranking Section */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-900">DRIVER RANKING</h3>
          <h3 className="text-slate-900">SCANS</h3>
        </div>
        <div className="space-y-3">
          {rankings.map((ranking) => (
            <div
              key={ranking.rank}
              className={`flex items-center justify-between p-4 rounded-lg ${
                ranking.isUser
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-4">
                <span
                  className={`${
                    ranking.isUser
                      ? "text-blue-600"
                      : "text-slate-600"
                  }`}
                >
                  #{ranking.rank}
                </span>
                <span
                  className={`${
                    ranking.isUser
                      ? "text-blue-900"
                      : "text-slate-800"
                  }`}
                >
                  {ranking.driver}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-slate-500 text-sm">Scans</span>
                <span
                  className={`${
                    ranking.isUser
                      ? "text-blue-900"
                      : "text-slate-900"
                  }`}
                >
                  {ranking.scans}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      {/* Task Progress Overview */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-slate-900 mb-2">TASK PROGRESS</h3>
            <p className="text-slate-600">Complete tasks to unlock bonuses and increase your earnings</p>
          </div>
          <div className="text-right">
            <div className="text-4xl text-blue-600 mb-1">{tasks.filter(t => t.completed).length}/{tasks.length}</div>
            <div className="text-slate-500 text-sm">Completed</div>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* All Tasks List */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">ALL TASKS</h3>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                task.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`task-detail-${task.id}`}
                    checked={task.completed}
                    className="border-slate-300"
                  />
                  <label
                    htmlFor={`task-detail-${task.id}`}
                    className={`cursor-pointer ${
                      task.completed ? "text-slate-600 line-through" : "text-slate-900"
                    }`}
                  >
                    {task.text}
                  </label>
                </div>
                {task.completed && (
                  <Check className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex items-center justify-between ml-9">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-slate-600">Bonus: {task.bonus}</span>
                </div>
                {!task.completed && (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2">
                    Start Task
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Task Rewards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center space-x-3 mb-2">
            <Award className="w-6 h-6 text-green-600" />
            <h4 className="text-slate-900">Earned Bonuses</h4>
          </div>
          <div className="text-3xl text-green-700">$80</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            <h4 className="text-slate-900">Pending Bonuses</h4>
          </div>
          <div className="text-3xl text-yellow-700">$65</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h4 className="text-slate-900">Next Milestone</h4>
          </div>
          <div className="text-3xl text-blue-700">$100</div>
        </Card>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-slate-600">Total Hours</h4>
          </div>
          <div className="text-3xl text-slate-900">115h</div>
          <div className="text-sm text-green-600 mt-1">↑ 12% from last month</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-slate-600">Avg Daily Hours</h4>
          </div>
          <div className="text-3xl text-slate-900">7.2h</div>
          <div className="text-sm text-green-600 mt-1">↑ 8% from last week</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <QrCode className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-slate-600">Total Scans</h4>
          </div>
          <div className="text-3xl text-slate-900">342</div>
          <div className="text-sm text-green-600 mt-1">↑ 24% from last month</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="text-slate-600">Total Earnings</h4>
          </div>
          <div className="text-3xl text-slate-900">$864</div>
          <div className="text-sm text-green-600 mt-1">↑ 18% from last month</div>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">WEEKLY PERFORMANCE</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="earnings" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-600">Hours</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-slate-600">Earnings ($)</span>
          </div>
        </div>
      </Card>

      {/* Daily Activity Breakdown */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">DAILY BREAKDOWN</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  const renderScans = () => (
    <div className="space-y-6">
      {/* Scan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h4 className="text-slate-600">Total Scans Today</h4>
          </div>
          <div className="text-4xl text-slate-900">18</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="w-8 h-8 text-green-600" />
            <h4 className="text-slate-600">Active Locations</h4>
          </div>
          <div className="text-4xl text-slate-900">4</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <Award className="w-8 h-8 text-yellow-600" />
            <h4 className="text-slate-600">Scan Earnings</h4>
          </div>
          <div className="text-4xl text-slate-900">$14.00</div>
        </Card>
      </div>

      {/* Map and Location Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-slate-900 mb-6">SCAN LOCATIONS</h3>
          <div className="w-full h-64 bg-slate-100 rounded-lg relative overflow-hidden mb-6">
            {/* Enhanced map representation */}
            <div className="absolute inset-0 opacity-20">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-full"
                style={{ fill: "none", stroke: "#cbd5e1", strokeWidth: 1 }}
              >
                <path d="M0,75 L400,75 M0,150 L400,150 M0,225 L400,225" />
                <path d="M100,0 L100,300 M200,0 L200,300 M300,0 L300,300" />
              </svg>
            </div>
            {/* Location pins */}
            <div className="absolute top-1/4 left-1/4">
              <MapPin className="w-6 h-6 text-blue-600 fill-blue-200" />
            </div>
            <div className="absolute top-1/2 left-1/2">
              <MapPin className="w-6 h-6 text-green-600 fill-green-200" />
            </div>
            <div className="absolute top-2/3 left-2/3">
              <MapPin className="w-6 h-6 text-purple-600 fill-purple-200" />
            </div>
            <div className="absolute top-1/3 left-3/4">
              <MapPin className="w-6 h-6 text-yellow-600 fill-yellow-200" />
            </div>
          </div>
          <div className="space-y-3">
            {scanLocations.map((location, index) => (
              <div
                key={location.name}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className={`w-5 h-5 ${
                    index === 0 ? "text-blue-600" :
                    index === 1 ? "text-green-600" :
                    index === 2 ? "text-purple-600" :
                    "text-yellow-600"
                  }`} />
                  <span className="text-slate-800">{location.name}</span>
                </div>
                <span className="text-slate-900 font-medium">
                  {location.count} scans
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Scan History */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-slate-900 mb-6">RECENT SCAN ACTIVITY</h3>
          <div className="space-y-3">
            {scanHistory.map((scan, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-900">{scan.location}</span>
                  </div>
                  <span className="text-blue-600">{scan.scans} scans</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>{scan.date}</span>
                  <span>•</span>
                  <span>{scan.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Driver Ranking */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-900">LEADERBOARD</h3>
          <span className="text-sm text-slate-500">Top performers this week</span>
        </div>
        <div className="space-y-3">
          {rankings.map((ranking) => (
            <div
              key={ranking.rank}
              className={`flex items-center justify-between p-5 rounded-lg transition-all ${
                ranking.isUser
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ranking.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                  ranking.rank === 2 ? "bg-slate-300 text-slate-700" :
                  ranking.rank === 3 ? "bg-orange-400 text-orange-900" :
                  "bg-slate-200 text-slate-600"
                }`}>
                  #{ranking.rank}
                </div>
                <span
                  className={`text-lg ${
                    ranking.isUser
                      ? "text-blue-900"
                      : "text-slate-800"
                  }`}
                >
                  {ranking.driver}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <QrCode className={`w-5 h-5 ${ranking.isUser ? "text-blue-600" : "text-slate-500"}`} />
                <span
                  className={`text-xl ${
                    ranking.isUser
                      ? "text-blue-900"
                      : "text-slate-900"
                  }`}
                >
                  {ranking.scans}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-blue-100 rounded-full">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-slate-900">Email Support</h4>
            <p className="text-sm text-slate-600">support@appipy.com</p>
            <p className="text-xs text-slate-500">Response within 24 hours</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-green-100 rounded-full">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-slate-900">Phone Support</h4>
            <p className="text-sm text-slate-600">1-800-APPIPY</p>
            <p className="text-xs text-slate-500">Mon-Fri 9AM-6PM EST</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-purple-100 rounded-full">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-slate-900">Live Chat</h4>
            <p className="text-sm text-slate-600">Chat with an agent</p>
            <p className="text-xs text-slate-500">Available 24/7</p>
          </div>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <h3 className="text-slate-900 mb-6">SEND US A MESSAGE</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-2">Subject</label>
            <Input
              placeholder="What do you need help with?"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-2">Message</label>
            <Textarea
              placeholder="Describe your issue or question..."
              className="w-full min-h-32"
            />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
            Send Message
          </Button>
        </form>
      </Card>

      {/* FAQ Section */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-slate-900">FREQUENTLY ASKED QUESTIONS</h3>
        </div>
        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <h4 className="text-slate-900 mb-2">{faq.question}</h4>
              <p className="text-slate-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Resources */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-slate-900">HELPFUL RESOURCES</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
            <h4 className="text-blue-900 mb-2">Getting Started Guide</h4>
            <p className="text-sm text-blue-700">Learn how to maximize your earnings</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
            <h4 className="text-green-900 mb-2">Payment Information</h4>
            <p className="text-sm text-green-700">How and when you get paid</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
            <h4 className="text-purple-900 mb-2">QR Code Setup</h4>
            <p className="text-sm text-purple-700">Installation and maintenance tips</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer">
            <h4 className="text-yellow-900 mb-2">Terms & Conditions</h4>
            <p className="text-sm text-yellow-700">Read our policies and guidelines</p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "text-slate-900 border-b-4 border-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center space-x-2 border-slate-300 hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Show only on My Earnings tab */}
        {activeTab === "My Earnings" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-slate-500 text-sm mb-2">THIS WEEK</div>
              <div className="text-slate-900 text-4xl">$68.00</div>
            </Card>
            <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-slate-500 text-sm mb-2">THIS MONTH</div>
              <div className="text-slate-900 text-4xl">$241.50</div>
            </Card>
            <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-slate-500 text-sm mb-2">SCAN BONUS</div>
              <div className="text-slate-900 text-4xl">$14.00</div>
            </Card>
            <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-slate-500 text-sm mb-2">NEXT PAYOUT</div>
              <div className="text-slate-900 text-4xl">Friday</div>
            </Card>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "My Earnings" && renderMyEarnings()}
        {activeTab === "Tasks" && renderTasks()}
        {activeTab === "Activity" && renderActivity()}
        {activeTab === "Scans" && renderScans()}
        {activeTab === "Support" && renderSupport()}
      </div>
    </div>
  );
}