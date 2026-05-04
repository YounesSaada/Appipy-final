import { Card, CardContent } from "./ui/card";
import { Battery, Car, Gamepad2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const addOns = [
  {
    icon: Battery,
    title: "Appipy ChargeLink",
    description: "Advertising at EV charging stations — free charging or discounts for engagement.",
    image: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZ3xlbnwxfHx8fDE3NjI2NTQwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Car,
    title: "Smart Car Magnets",
    description: "Cars with Appipy magnets verified by beacon or GPS for visibility pay.",
    image: "https://images.unsplash.com/photo-1610320022580-5295faad847c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGJ1c2luZXNzJTIwc3RvcmVmcm9udHxlbnwxfHx8fDE3NjI3MjMxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Gamepad2,
    title: "Gamified Ads",
    description: "QR codes that open games or feedback forms — users earn by interacting.",
    image: "https://images.unsplash.com/photo-1762340915700-356b34475448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwUVIlMjBjb2RlJTIwc2NhbnxlbnwxfHx8fDE3NjI3NTcwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function FutureAddOns() {
  return (
    <section id="future-addons" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-200 text-blue-900 rounded-full mb-4 text-lg font-bold">
             Future Add-Ons
          </div>
          <h2 className="text-gray-900 mb-6">
            Innovation Never Stops
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're constantly exploring new ways to connect people and businesses. 
            Here's what's coming next.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {addOns.map((addOn, index) => (
            <Card key={index} className="overflow-hidden border-2 hover:border-blue-700 transition-colors group">
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={addOn.image}
                  alt={addOn.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <addOn.icon className="w-6 h-6 text-blue-800" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {index === 2 && (
                  <>
                    <h3 className="text-gray-900 mb-3">{addOn.title}</h3>
                    <p className="text-gray-600">{addOn.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}