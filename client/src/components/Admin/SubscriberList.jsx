import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Send, Trash2, Search, Calendar, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Input from '../Shared/Input';
import Loader from '../Shared/Loader';
import { formatDate } from '../../utils/helpers';

export default function SubscriberList() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [newsletterModal, setNewsletterModal] = useState(false);
    const [newsletterData, setNewsletterData] = useState({ subject: '', content: '' });
    const toast = useToast();

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const data = await api.marketing.subscribers();
            setSubscribers(data);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        if (!newsletterData.subject || !newsletterData.content) {
            toast.error('Please fill in both subject and content');
            return;
        }

        setSending(true);
        try {
            await api.marketing.sendNewsletter(newsletterData);
            toast.success('Newsletter sent successfully!');
            setNewsletterModal(false);
            setNewsletterData({ subject: '', content: '' });
        } catch (error) {
            console.error('Error sending newsletter:', error);
            toast.error('Failed to send newsletter');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (email) => {
        if (!window.confirm(`Are you sure you want to remove ${email} from the list?`)) return;

        try {
            await api.marketing.deleteSubscriber(email);
            setSubscribers(prev => prev.filter(sub => sub.email !== email));
            toast.success('Subscriber removed');
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            toast.error('Failed to remove subscriber');
        }
    };

    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(sub =>
            sub.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [subscribers, search]);

    const activeSubscribers = subscribers.filter(s => s.status === 'active' || !s.status).length;

    const darkInputClass = "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/20";

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            {loading ? (
                <Loader fullPage={false} message="Synchronizing marketing data..." />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                        <div className="space-y-2">
                            <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">Market Reach</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                    <CheckCircle size={14} /> {activeSubscribers} Prime Channels
                                </span>
                                <div className="w-1 h-1 rounded-full bg-gray-700" />
                                <span className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    <Mail size={14} /> Total Database: {subscribers.length}
                                </span>
                            </div>
                        </div>
                        <Button onClick={() => setNewsletterModal(true)} variant="primary" size="lg" className="shadow-glow whitespace-nowrap">
                            <Send size={20} className="mr-2 stroke-[3]" /> Broadcast Newsletter
                        </Button>
                    </div>

                    {/* Search and Stats */}
                    <div className="bg-midnight/40 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/5 animate-luxury-entry stagger-2">
                        <div className="relative group">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-all duration-300" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search marketing channels..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 transition-all placeholder:text-gray-600 font-medium"
                            />
                        </div>
                    </div>

                    {/* Subscribers List */}
                    <div className="bg-midnight/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-luxury-entry stagger-3">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Subscriber Endpoint</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:table-cell">Affiliation Date</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Connectivity</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredSubscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-24 text-gray-600 font-bold uppercase tracking-widest">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-gray-600 shadow-2xl">
                                                        <Mail size={32} />
                                                    </div>
                                                    <p className="text-gray-400">Database Entry Partition Empty</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredSubscribers.map((sub, i) => (
                                        <tr key={sub.id || sub.email} className="hover:bg-white/5 transition-all duration-500 group border-b border-white/5 last:border-0">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-orange-500/20 text-gold flex items-center justify-center font-black text-sm shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                        {sub.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-white font-bold group-hover:text-gold transition-colors">{sub.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 hidden sm:table-cell text-gray-500">
                                                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest">
                                                    <Calendar size={14} className="text-gray-600" />
                                                    {formatDate(sub.createdAt || sub.subscribedAt || new Date())}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all group-hover:bg-current group-hover:text-midnight ${sub.status === 'active' || !sub.status ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}>
                                                    {sub.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDelete(sub.email)}
                                                    className="p-3 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] text-gray-500 transition-all opacity-0 group-hover:opacity-100 transform group-hover:translate-x-[-8px]"
                                                    title="Purge Channel"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Newsletter Modal */}
            <Modal
                isOpen={newsletterModal}
                onClose={() => setNewsletterModal(false)}
                title="Broadcast Transmission"
                size="md"
                className="bg-midnight-deep/95 backdrop-blur-3xl border border-white/10 text-white rounded-[2.5rem] shadow-2xl"
                headerClassName="border-white/5 py-8 px-10"
            >
                <form onSubmit={handleSendNewsletter} className="space-y-4">
                    <Input
                        label="Subject Line"
                        placeholder="e.g., New Collection Drop: Summer 2026"
                        value={newsletterData.subject}
                        onChange={e => setNewsletterData({ ...newsletterData, subject: e.target.value })}
                        required
                        inputClassName={darkInputClass}
                    />

                    <Input
                        type="textarea"
                        label="Email Content"
                        placeholder="Write your message here..."
                        value={newsletterData.content}
                        onChange={e => setNewsletterData({ ...newsletterData, content: e.target.value })}
                        required
                        rows={8}
                        inputClassName={darkInputClass}
                    />

                    <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                        <AlertCircle size={16} />
                        <p>This will be sent to <strong>{activeSubscribers}</strong> active subscribers immediately.</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <div className="w-1/2">
                            <Button type="button" variant="glass" onClick={() => setNewsletterModal(false)} fullWidth>
                                Cancel
                            </Button>
                        </div>
                        <div className="w-1/2">
                            <Button type="submit" variant="primary" loading={sending} fullWidth>
                                <Send size={18} className="mr-2" /> Send
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
