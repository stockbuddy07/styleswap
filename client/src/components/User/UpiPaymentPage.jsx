import React, { useState } from 'react';
import { ArrowLeft, Loader2, QrCode, Send, Smartphone, ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import Button from '../Shared/Button';
import { formatCurrency } from '../../utils/helpers';

export default function UpiPaymentPage({ onNavigate, onBack }) {
    const { grandTotal, groupCartByVendor, uniqueVendorCount } = useCart();
    const toast = useToast();
    const [mode, setMode] = useState('upi-id');
    const [userUpi, setUserUpi] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrSvg, setQrSvg] = useState('');
    const [upiLink, setUpiLink] = useState('');
    const amount = Math.round(grandTotal);
    const merchantUpi = 'premalariwala0@oksbi';
    const orderId = 'SS-' + Date.now().toString(36).slice(-6);

    const vendorGroups = groupCartByVendor();

    const generateQR = async () => {
        setLoading(true);
        try {
            const response = await api.payments.request({
                upi: 'self-qr',
                amount,
                orderId
            });
            toast.success('QR Generated!');
            setQrSvg(response.qr);
            setUpiLink(response.link);
        } catch (err) {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    const sendUpiRequest = async () => {
        if (!userUpi.trim()) {
            toast.error('Enter UPI ID');
            return;
        }
        setLoading(true);
        try {
            const response = await api.payments.request({
                upi: userUpi,
                amount,
                orderId
            });
            toast.success(`Sent to ${userUpi}`);
        } catch (err) {
            toast.error('Request failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePayLink = () => {
        if (upiLink) window.open(upiLink, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-playfair font-bold text-midnight">Complete Payment</h1>
                        <p className="text-lg text-gray-600">{uniqueVendorCount} vendor{uniqueVendorCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-midnight mb-1">Order Summary</h2>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-black">Rental Period</p>
                        </div>
                        <ShoppingBag size={48} className="text-gold" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {Object.values(vendorGroups).map((group, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-2xl text-center">
                                <p className="font-bold text-midnight">{group.shopName}</p>
                                <p className="text-sm text-gray-600">{group.items.length} items</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-6">
                        <div className="flex justify-between text-2xl font-bold">
                            <span>Total</span>
                            <span className="text-gold">{formatCurrency(amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex gap-4 mb-8">
                        <button 
                            onClick={() => setMode('upi-id')}
                            className={`flex-1 p-6 rounded-2xl font-bold transition-all border-4 ${mode === 'upi-id' ? 'border-indigo-500 bg-indigo-50 shadow-2xl' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                        >
                            <Smartphone size={32} className={`mx-auto mb-3 ${mode === 'upi-id' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <div>Pay via UPI</div>
                            <div className="text-xs text-gray-500">Enter payer ID</div>
                        </button>
                        <button 
                            onClick={() => setMode('generate-qr')}
                            className={`flex-1 p-6 rounded-2xl font-bold transition-all border-4 ${mode === 'generate-qr' ? 'border-green-500 bg-green-50 shadow-2xl' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                        >
                            <QrCode size={32} className={`mx-auto mb-3 ${mode === 'generate-qr' ? 'text-green-600' : 'text-gray-400'}`} />
                            <div>QR Code</div>
                            <div className="text-xs text-gray-500">Share & scan</div>
                        </button>
                    </div>

                    {/* UPI ID Mode */}
                    {mode === 'upi-id' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Payer UPI ID</label>
                                <input 
                                    type="text"
                                    value={userUpi}
                                    onChange={(e) => setUserUpi(e.target.value)}
                                    placeholder="payer@ybl"
                                    className="w-full p-6 border-2 border-gray-200 rounded-3xl text-xl font-mono text-center focus:border-gold focus:ring-4 focus:ring-gold/20"
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center font-mono">Will receive payment request</p>
                            </div>
                            <Button 
                                onClick={sendUpiRequest}
                                disabled={loading}
                                className="w-full h-16 text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Send className="w-6 h-6 mr-3" />}
                                Send UPI Request
                            </Button>
                        </div>
                    )}

                    {/* QR Mode */}
                    {mode === 'generate-qr' && (
                        <div className="space-y-6">
                            <p className="text-center text-lg font-bold text-midnight mb-6">Share QR - Pays to <span className="font-mono text-gold">premalariwala0@oksbi</span></p>
                            <Button 
                                onClick={generateQR}
                                disabled={loading}
                                className="w-full h-16 text-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <QrCode className="w-6 h-6 mr-3" />}
                                Generate QR Code
                            </Button>
                            {qrSvg && (
                                <div className="bg-gradient-to-b from-emerald-50 to-green-50 p-8 rounded-3xl border-4 border-green-200 shadow-2xl text-center">
                                    <CheckCircle size={48} className="mx-auto text-green-600 mb-6" />
                                    <h3 className="text-2xl font-bold text-green-800 mb-4">QR Ready!</h3>
                                    <div className="bg-white p-8 rounded-3xl shadow-xl mb-6 max-w-sm mx-auto" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                                    <p className="text-lg text-green-700 mb-6">Payer scans → instant payment to your UPI</p>
                                    <Button onClick={handlePayLink} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg mb-4">
                                        Open UPI App
                                    </Button>
                                    <div className="p-4 bg-white rounded-2xl font-mono text-sm break-all">
                                        {upiLink}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

