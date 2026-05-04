import hero2 from "../assets/hero2.png";
import hero1 from "../assets/hero1.png";
import { Button } from "./ui/button";
import { MapPin, Zap, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={hero2}
          alt="City street with people"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-8 flex justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mt-12">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white">The Uber of Real-World Attention</span>
          </div>
        </div>
        
        <h1 className="text-white mb-6 max-w-4xl mx-auto">
          Earn Money for Being Present. Help Local Businesses Advertise Affordably.
        </h1>
        
        <p className="text-xl text-blue-50 mb-12 max-w-2xl mx-auto">
          Appipy connects real people, real locations, and real engagement. No fake clicks. No expensive ads. Just transparent, community-driven advertising.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-yellow-400 text-slate-900 hover:bg-yellow-300">
            Join the Pilot Program
          </Button>
          <Button size="lg" variant="outline" className="border-white text-[rgb(19,10,67)] hover:bg-white/10">
            For Businesses
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <Users className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
            <div className="text-white mb-1">Real People</div>
            <p className="text-blue-50">Earn by being present and active</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <MapPin className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
            <div className="text-white mb-1">Real Locations</div>
            <p className="text-blue-50">Hot zones and high-traffic areas</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <Zap className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
            <div className="text-white mb-1">Real Engagement</div>
            <p className="text-blue-50">Transparent, verified interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
