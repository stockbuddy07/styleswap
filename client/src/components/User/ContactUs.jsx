import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import { useToast } from '../../context/ToastContext';

export default function ContactUs() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Message sent! We'll get back to you soon.`);
        setForm({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
    };

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-12 animate-fade-in-up">
            <div className="text-center mb-16">
                <h1 className="font-playfair text-4xl font-bold text-midnight mb-4">Get in Touch</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Have questions about our luxury collection or need assistance with your rental?
                    Our dedicated concierge team is here to help you coordinate the perfect look.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                        <h3 className="font-playfair text-xl font-bold text-midnight mb-6">Contact Information</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone size={20} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-midnight uppercase tracking-wide mb-1">Phone</p>
                                    <p className="text-gray-600">+91 98765 43210</p>
                                    <p className="text-gray-500 text-xs mt-1">Mon-Sat, 9am - 8pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail size={20} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-midnight uppercase tracking-wide mb-1">Email</p>
                                    <p className="text-gray-600">concierge@styleswap.com</p>
                                    <p className="text-gray-500 text-xs mt-1">24/7 Support</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin size={20} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-midnight uppercase tracking-wide mb-1">Headquarters</p>
                                    <p className="text-gray-600">123 Fashion Avenue, Bandra West</p>
                                    <p className="text-gray-600">Mumbai, Maharashtra 400050</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h4 className="font-bold text-midnight mb-4">Connect With Us</h4>
                            <div className="flex gap-4">
                                {['Instagram', 'Twitter', 'Facebook'].map(social => (
                                    <button key={social} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gold hover:text-white transition-colors">
                                        {social}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label="Your Name"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    required
                                    placeholder="John Doe"
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <Input
                                label="Subject"
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                required
                                placeholder="How can we help?"
                            />

                            <Input
                                label="Message"
                                type="textarea"
                                rows={6}
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                required
                                placeholder="Tell us more about your inquiry..."
                            />

                            <div className="flex items-center justify-end pt-4">
                                <Button type="submit" loading={loading} size="lg" className="min-w-[150px]">
                                    <Send size={18} className="mr-2" /> Send Message
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* FAQ Teaser */}
            <div className="mt-20 text-center">
                <h2 className="font-playfair text-2xl font-bold text-midnight mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { q: 'How does the rental process work?', a: 'Select your dates, book the outfit, and return it using our prepaid label.' },
                        { q: 'Is there a security deposit?', a: 'Yes, a fully refundable deposit is charged at booking and returned after quality check.' },
                        { q: 'What if the size doesn\'t fit?', a: 'We offer a 24-hour return policy for fit issues with a full refund of rental charges.' }
                    ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-6 rounded-xl text-left hover:bg-white hover:shadow-md transition-all">
                            <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gold font-bold mb-4">?</div>
                            <h3 className="font-bold text-midnight mb-2">{item.q}</h3>
                            <p className="text-gray-600 text-sm">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
