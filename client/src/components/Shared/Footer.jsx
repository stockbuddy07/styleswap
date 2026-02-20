import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

import { useAuth } from '../../context/AuthContext';

export default function Footer({ onNavigate, onCategorySelect }) {
    const toast = useToast();
    const { isAdmin, isSubAdmin } = useAuth();
    const [email, setEmail] = useState('');

    const handleSubscribe = async (e) => {
        // ... (existing code)
    };

    // ... (handleLinkClick code)

    return (
        <footer className="relative z-20 bg-midnight text-white border-t border-white/10 mt-auto">
            {/* Newsletter Section - Hidden for Admins */}
            {!isAdmin && !isSubAdmin && (
                <div className="bg-gradient-to-r from-midnight-deep via-midnight to-midnight-deep py-20 px-6 border-b border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="text-center lg:text-left space-y-4">
                            <h3 className="font-playfair text-5xl font-black tracking-tighter text-white">The Style Circle</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Access to the most exclusive rental fragments.</p>
                        </div>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 w-full lg:w-96 transition-all duration-500 font-medium"
                                />
                            </div>
                            <button type="submit" className="bg-white text-midnight font-black px-10 py-5 rounded-2xl hover:bg-gold hover:shadow-glow hover:-translate-y-1 active:translate-y-0 transition-all duration-300 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                                Participate <ArrowRight size={18} strokeWidth={3} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Footer Content */}
            <div className="max-w-screen-xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('home')}>
                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-700">
                            <span className="text-midnight font-playfair font-black text-xl">S</span>
                        </div>
                        <span className="font-playfair font-black text-2xl tracking-tighter text-white">
                            Style<span className="text-gold">Swap</span>
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
                        Refining the architecture of fashion. Access verified luxury assets from elite collections across the nation. Experience couture, redefined.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <SocialIcon icon={Facebook} href="https://facebook.com" />
                        <SocialIcon icon={Instagram} href="https://instagram.com" />
                        <SocialIcon icon={Twitter} href="https://twitter.com" />
                        <SocialIcon icon={Linkedin} href="https://linkedin.com" />
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10">Asset Catalog</h4>
                    <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest text-gray-500">
                        <FooterLink onClick={(e) => handleLinkClick(e, 'navigate', 'catalog')}>New Discoveries</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'category', 'Wedding')}>Occasion · Wedding</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'category', 'Designer')}>Couture Elite</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'category', 'Men')}>Gentlemen's Edit</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'category', 'Accessories')}>Refined Accents</FooterLink>
                    </ul>
                </div>

                {/* Customer Service */}
                <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10">Operations</h4>
                    <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest text-gray-500">
                        <FooterLink onClick={(e) => handleLinkClick(e, 'navigate', 'contact')}>Global Concierge</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'coming-soon')}>Protocol & Terms</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'coming-soon')}>Reclamation Policy</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'coming-soon')}>Proportion Guide</FooterLink>
                        <FooterLink onClick={(e) => handleLinkClick(e, 'navigate', 'contact')}>Secure Linkage</FooterLink>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10">HQ Coordinates</h4>
                    <ul className="space-y-6 text-[11px] font-bold text-gray-500">
                        <li className="flex items-start gap-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-gold group-hover:bg-gold group-hover:text-midnight transition-colors"><MapPin size={16} /></div>
                            <span className="leading-relaxed">S10 Harikrishna Residency,<br />Bholav Bharuch 392015</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-gold group-hover:bg-gold group-hover:text-midnight transition-colors"><Phone size={16} /></div>
                            <span>+91 9725056461</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-gold group-hover:bg-gold group-hover:text-midnight transition-colors"><Mail size={16} /></div>
                            <span className="lowercase">ayushgajjar123@gmail.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 bg-black/20">
                <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} StyleSwap. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition-colors">Privacy Policy</a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition-colors">Terms of Service</a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon, href }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gold hover:text-midnight transition-all">
            <Icon size={18} />
        </a>
    );
}

function FooterLink({ children, onClick }) {
    return (
        <li>
            <button onClick={onClick} className="hover:text-gold transition-colors flex items-center gap-2 group text-left w-full">
                <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300">→</span>
                {children}
            </button>
        </li>
    );
}
