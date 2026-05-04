import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MapPin, Target, TrendingUp } from "lucide-react";

export function PilotProgram() {
  return (
    <section id="pilot-program" className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-200 text-blue-900 rounded-full mb-4 text-lg font-bold block">
            Our Starting Point
          </div>
          <Button size="lg" className="mt-6 mb-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 block mx-auto px-8">
            Join Our Pilot Program
          </Button>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're launching in St-Henri and Griffintown to prove that real-world engagement works. 
            Be part of the revolution.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-blue-300">
            <CardContent className="p-8">
              <MapPin className="w-12 h-12 text-blue-800 mb-4" />
              <h3 className="text-gray-900 mb-4">Pilot Locations</h3>
              <p className="text-gray-600 mb-4">
                We're starting in two vibrant Montreal neighborhoods known for their local businesses and community spirit.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-800 rounded-full"></div>
                  St-Henri
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-800 rounded-full"></div>
                  Griffintown
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-blue-300">
            <CardContent className="p-8">
              <Target className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-gray-900 mb-4">Our First Goals</h3>
              <p className="text-gray-600 mb-4">
                We're manually proving that people will engage with real-world advertising:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Check into "Hot Zones"
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Scan local business QR codes
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Earn or redeem small rewards
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <TrendingUp className="w-12 h-12 text-blue-800 mb-4" />
              <h3 className="text-gray-900 mb-3">
                Be an Early Adopter
              </h3>
              <p className="text-gray-600">
                Join our pilot program and help shape the future of local advertising. 
                Early members get exclusive perks, higher earning rates, and direct influence on product development.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-950 hover:to-blue-800">
                Join as a User
              </Button>
              <Button size="lg" variant="outline" className="border-blue-700 text-blue-900 hover:bg-blue-100">
                Register Your Business
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
