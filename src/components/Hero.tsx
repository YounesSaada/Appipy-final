import { Button } from "./ui/button";
import { ArrowRight, MapPin, Users, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1723479813298-e1a50fea7458?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGNpdHklMjBzdHJlZXR8ZW58MXx8fHwxNzYyNzAwMjE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/90 to-pink-900/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-white/90">The Uber of Real-World Attention</span>
        </div>

        <h1 className="text-white mb-6 max-w-4xl mx-auto">
          Turn Your Presence Into Profit
        </h1>
        
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Appipy connects everyday people with local businesses. Earn money for being present, visible, and active in the real world while helping businesses advertise affordably and transparently.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
            Start Earning Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10">
            For Businesses
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <MapPin className="w-8 h-8 text-blue-300 mx-auto mb-3" />
            <div className="text-white mb-1">Real Locations</div>
            <p className="text-sm text-white/70">Track presence with GPS & beacons</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <Users className="w-8 h-8 text-purple-300 mx-auto mb-3" />
            <div className="text-white mb-1">Real People</div>
            <p className="text-sm text-white/70">Community-driven engagement</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <Sparkles className="w-8 h-8 text-pink-300 mx-auto mb-3" />
            <div className="text-white mb-1">Real Rewards</div>
            <p className="text-sm text-white/70">Instant earnings & transparency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
