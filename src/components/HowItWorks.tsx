import { Card, CardContent } from "./ui/card";
import { QrCode, Radio, BarChart3 } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Campaigns",
    description: "Businesses run small promos, people scan QR codes on signs, screens, or cars and get rewarded instantly.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  {
    icon: Radio,
    title: "GPS",
    description: "Track presence automatically. No lying, no fake clicks. Everything is verified and transparent.",
    color: "text-blue-800",
    bgColor: "bg-blue-200"
  },
  {
    icon: BarChart3,
    title: "Appipy Dashboard",
    description: "Businesses see exactly what they're paying for. Users see exactly what they've earned. Full transparency.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-200 text-blue-900 rounded-full mb-4 text-lg font-bold">
             How It Works
          </div>
          <h2 className="text-gray-900 mb-6">
            Simple, Transparent, and Effective
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Appipy makes it easy for anyone to earn money while helping local businesses grow. 
            Here's how our platform creates value for everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-blue-700 transition-colors">
              <CardContent className="p-6">
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="mb-4">
            It's a Win-Win
          </h3>
          <p className="text-xl mb-2">
            People make money · Businesses save money · Everything is transparent
          </p>
        </div>
      </div>
    </section>
  );
}