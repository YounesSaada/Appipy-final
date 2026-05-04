import { MapPin, Mail, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-blue-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="text-2xl text-white">Appipy</span>
            </div>
            <p className="text-slate-400 mb-4">
              The Uber of real-world attention. Connecting people, businesses, and communities through transparent, real-world engagement.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="hover:text-yellow-400 transition-colors">How It Works</a></li>
              <li><a href="#for-users" className="hover:text-yellow-400 transition-colors">For Users</a></li>
              <li><a href="#for-businesses" className="hover:text-yellow-400 transition-colors">For Businesses</a></li>
              <li><a href="#pilot" className="hover:text-yellow-400 transition-colors">Pilot Program</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-yellow-400" />
                <a href="mailto:hello@appipy.com" className="hover:text-yellow-400 transition-colors">
                  hello@appipy.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-yellow-400 mt-1" />
                <span>
                Montreal, QC
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400">© 2025 Appipy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
