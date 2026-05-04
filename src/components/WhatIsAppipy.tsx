import { CheckCircle2 } from "lucide-react";

export function WhatIsAppipy() {
  return (
    <section id="what-is-appipy" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[rgb(221,221,255)] text-blue-900 rounded-full mb-10 text-lg font-bold">
             What is Appipy 
          </div>
          <h2 className="text-gray-900 mb-6 max-w-3xl mx-auto">
            A Community-Driven Platform That Rewards Real-World Presence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Appipy lets everyday people earn money for being present, visible, and active in the real world, 
            while helping local businesses advertise affordably and transparently.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">No Expensive Online Ads</h3>
                  <p className="text-gray-600">
                    Traditional digital advertising is costly and often ignored. Appipy brings advertising back to the real world.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">Real People, Real Locations</h3>
                  <p className="text-gray-600">
                    Connect with actual people in physical locations, not bots or fake accounts.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">Complete Transparency</h3>
                  <p className="text-gray-600">
                    Businesses see exactly what they're paying for. Users see exactly what they've earned. No hidden fees.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">Win-Win Solution</h3>
                  <p className="text-gray-600">
                    People make money by being active in their community. Businesses save money on effective local advertising.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-800 to-yellow-400 p-1">
              <div className="w-full h-full bg-white rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-gray-900 mb-2">The Uber of Real-World Attention</h3>
                  <p className="text-gray-600">
                    Just like Uber revolutionized transportation, Appipy is revolutionizing local advertising.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
