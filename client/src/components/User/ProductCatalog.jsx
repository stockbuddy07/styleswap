import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, X, ChevronDown, Store } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../Shared/Modal';
import Button from '../Shared/Button';
import { formatCurrency, getStockStatus, getTodayString } from '../../utils/helpers';

const CATEGORIES = ['All', 'Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];
const SORT_OPTIONS = [
    { value: 'name_asc', label: 'Name A–Z' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Top Rated' },
];

function AddToCartModal({ product, isOpen, onClose }) {
    const { addToCart, cartItems } = useCart();
    const toast = useToast();
    const today = getTodayString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(tomorrow);
    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        if (isOpen) {
            setSize('');
            setQuantity(1);
            setStartDate(today);
            setEndDate(tomorrow);
            setErrors({});
        }
    }, [isOpen]);

    if (!product) return null;

    const rentalDays = Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
    const rentalFee = product.pricePerDay * rentalDays * quantity;
    const deposit = product.securityDeposit * quantity;
    const total = rentalFee + deposit;
    const stock = getStockStatus(product.availableQuantity);

    const validate = () => {
        const errs = {};
        if (!size) errs.size = 'Please select a size';
        if (!startDate) errs.startDate = 'Required';
        if (!endDate) errs.endDate = 'Required';
        if (startDate && endDate && endDate <= startDate) errs.endDate = 'End date must be after start date';
        if (quantity < 1 || quantity > product.availableQuantity) errs.quantity = `Max available: ${product.availableQuantity}`;
        return errs;
    };

    const handleAddToCart = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addToCart(product, startDate, endDate, size, quantity);
        toast.success(`${product.name} added to cart!`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rent This Item" size="md">
            <div className="space-y-5">
                {/* Product summary */}
                <div className="flex gap-4">
                    <img src={product.images?.[0]} alt={product.name}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                        onError={e => { e.target.src = 'https://via.placeholder.com/96?text=?'; }} />
                    <div>
                        <h3 className="font-semibold text-midnight">{product.name}</h3>
                        <p className="text-gold text-sm font-medium">{product.shopName}</p>
                        <p className="text-2xl font-bold text-midnight mt-1">{formatCurrency(product.pricePerDay)}<span className="text-gray-400 text-sm font-normal">/day</span></p>
                        <span className={`badge mt-1 ${stock.color}`}>{stock.label} ({product.availableQuantity} left)</span>
                    </div>
                </div>

                {/* Size */}
                <div>
                    <label className="text-sm font-medium text-darkGray block mb-2">Size <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes?.map(s => (
                            <button key={s} type="button" onClick={() => setSize(s)}
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${size === s ? 'bg-midnight text-white border-midnight' : 'border-gray-300 text-gray-600 hover:border-midnight'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                    {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium text-darkGray block mb-1">Start Date <span className="text-red-500">*</span></label>
                        <input type="date" value={startDate} min={today}
                            onChange={e => setStartDate(e.target.value)}
                            className="input-field text-sm" />
                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-darkGray block mb-1">End Date <span className="text-red-500">*</span></label>
                        <input type="date" value={endDate} min={startDate || today}
                            onChange={e => setEndDate(e.target.value)}
                            className="input-field text-sm" />
                        {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                    </div>
                </div>

                {/* Quantity */}
                <div>
                    <label className="text-sm font-medium text-darkGray block mb-1">Quantity</label>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-lg font-bold">−</button>
                        <span className="w-8 text-center font-semibold text-midnight">{quantity}</span>
                        <button onClick={() => setQuantity(q => Math.min(product.availableQuantity, q + 1))}
                            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-lg font-bold">+</button>
                    </div>
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>

                {/* Price breakdown */}
                {rentalDays > 0 && (
                    <div className="bg-offWhite rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>{formatCurrency(product.pricePerDay)} × {rentalDays} days × {quantity}</span>
                            <span>{formatCurrency(rentalFee)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Security deposit × {quantity}</span>
                            <span>{formatCurrency(deposit)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-midnight border-t border-gray-200 pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                )}

                <Button fullWidth onClick={handleAddToCart} disabled={product.availableQuantity === 0}>
                    <ShoppingCart size={16} className="mr-2" />
                    {product.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </div>
        </Modal>
    );
}

function ProductCard({ product, onRent }) {
    const stock = getStockStatus(product.availableQuantity);
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="relative h-52">
                <img src={product.images?.[0]} alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/400x208?text=No+Image'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black from-0% via-transparent to-transparent opacity-60" />
                <span className={`absolute top-3 right-3 badge ${stock.color}`}>{stock.label}</span>
                <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Store size={11} className="text-gold" />
                        <span className="text-gold text-xs">{product.shopName}</span>
                    </div>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <span className="badge bg-blue-50 text-blue-700 self-start mb-2">{product.category}</span>
                <p className="text-gray-500 text-xs line-clamp-2 flex-1">{product.description}</p>
                {product.ratings > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                        <Star size={12} className="text-gold fill-gold" />
                        <span className="text-xs text-gray-600">{product.ratings}</span>
                    </div>
                )}
                <div className="flex items-center justify-between mt-3">
                    <div>
                        <span className="text-xl font-bold text-midnight">{formatCurrency(product.pricePerDay)}</span>
                        <span className="text-gray-400 text-xs">/day</span>
                    </div>
                    <Button size="sm" onClick={() => onRent(product)} disabled={product.availableQuantity === 0}>
                        Rent Now
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function ProductCatalog({ searchTerm = '', onRequireAuth }) {
    const { allProducts } = useProducts();
    const { currentUser } = useProducts(); // Assuming ProductContext or hook has access, or better pass it prop. 
    // Actually, useAuth is better here.
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('name_asc');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Helper to handle rent click
    const handleRentClick = (product) => {
        if (!localStorage.getItem('styleswap_token')) {
            if (onRequireAuth) onRequireAuth();
            return;
        }
        setSelectedProduct(product);
    };

    const filtered = useMemo(() => {
        let list = allProducts.filter(p => {
            const q = searchTerm.toLowerCase();
            const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
            const matchCat = category === 'All' || p.category === category;
            return matchSearch && matchCat;
        });

        switch (sort) {
            case 'price_asc': list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay); break;
            case 'price_desc': list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay); break;
            case 'rating_desc': list = [...list].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
            default: list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [allProducts, searchTerm, category, sort]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">Browse Products</h1>
                <p className="text-gray-500 text-sm mt-1">{filtered.length} items available for rent</p>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Category pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-midnight text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-midnight'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
                {/* Sort */}
                <div className="relative flex-shrink-0">
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white pr-8 appearance-none">
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Product Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Search size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="font-playfair text-xl font-semibold text-gray-500">No products found</h3>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(product => (
                        <ProductCard key={product.id} product={product} onRent={handleRentClick} />
                    ))}
                </div>
            )}

            <AddToCartModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
