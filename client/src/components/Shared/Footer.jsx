import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-midnight text-white border-t border-white/10 mt-auto">
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-blue-900 to-midnight py-12 px-4 border-b border-white/10">
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="font-playfair text-2xl font-bold mb-2">Join the Style Revolution</h3>
                        <p className="text-gray-300">Subscribe to get exclusive offers and new arrival updates.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold w-full md:w-80"
                        />
                        <button className="bg-gold text-midnight font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2">
                            Subscribe <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-screen-xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                            <span className="text-midnight font-playfair font-bold text-lg">S</span>
                        </div>
                        <span className="font-playfair font-bold text-xl tracking-wide">
                            Style<span className="text-gold">Swap</span>
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Experience luxury without the commitment. Rent premium fashion from top designers and verified lenders across the country.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <SocialIcon icon={Facebook} />
                        <SocialIcon icon={Instagram} />
                        <SocialIcon icon={Twitter} />
                        <SocialIcon icon={Linkedin} />
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <FooterLink>New Arrivals</FooterLink>
                        <FooterLink>Wedding Collection</FooterLink>
                        <FooterLink>Designer Wear</FooterLink>
                        <FooterLink>Men's Suits</FooterLink>
                        <FooterLink>Accessories</FooterLink>
                    </ul>
                </div>

                {/* Customer Service */}
                <div>
                    <h4 className="font-bold text-lg mb-6">Support</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <FooterLink>Help Center</FooterLink>
                        <FooterLink>Rental Terms</FooterLink>
                        <FooterLink>Return Policy</FooterLink>
                        <FooterLink>Size Guide</FooterLink>
                        <FooterLink>Contact Us</FooterLink>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="font-bold text-lg mb-6">Contact Us</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                            <span>123 Fashion Avenue, Design District,<br />New York, NY 10001</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-gold shrink-0" />
                            <span>+1 (555) 123-4567</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-gold shrink-0" />
                            <span>support@styleswap.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 bg-black/20">
                <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} StyleSwap. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gold transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon }) {
    return (
        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gold hover:text-midnight transition-all">
            <Icon size={18} />
        </a>
    );
}

function FooterLink({ children }) {
    return (
        <li>
            <a href="#" className="hover:text-gold transition-colors flex items-center gap-2 group">
                <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300">→</span>
                {children}
            </a>
        </li>
    );
}
