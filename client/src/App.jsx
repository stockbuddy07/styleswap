import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { X } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

import Loader from './components/Shared/Loader';
import Header from './components/Shared/Header';
import Sidebar from './components/Shared/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Admin
import Analytics from './components/Admin/Analytics';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import ProductOverview from './components/Admin/ProductOverview';

// SubAdmin
import ProductManagement from './components/SubAdmin/ProductManagement';
import InventoryDashboard from './components/SubAdmin/InventoryDashboard';
import SalesAnalytics from './components/SubAdmin/SalesAnalytics';
import ActiveRentals from './components/SubAdmin/ActiveRentals';
import VendorOnboarding from './components/SubAdmin/VendorOnboarding';

// User
import ProductCatalog from './components/User/ProductCatalog';
import CategoryRail from './components/User/Home/CategoryRail';
import ProductDetailsPage from './components/User/ProductDetailsPage';
import ProfileDashboard from './components/User/ProfileDashboard';
import OrdersDashboard from './components/User/OrdersDashboard';
import WishlistDashboard from './components/User/WishlistDashboard';
import CartPage from './components/User/CartPage';

import Footer from './components/Shared/Footer';
import ContactUs from './components/User/ContactUs';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) {
        console.error("App Crash:", error, errorInfo);
        this.setState({ error, errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="text-center max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X size={40} />
                        </div>
                        <h1 className="text-2xl font-playfair font-bold text-midnight mb-4">Something went wrong</h1>
                        <p className="text-gray-500 mb-6">StyleSwap encountered an unexpected error. This usually happens if the connection is lost or local data is corrupted.</p>

                        {this.state.error && (
                            <div className="mb-8 text-left bg-red-50 p-6 rounded-2xl border border-red-100 overflow-auto max-h-60">
                                <p className="font-bold text-red-700 mb-2">Error Detail:</p>
                                <code className="text-xs text-red-600 block whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {"\n\n"}
                                    {this.state.errorInfo?.componentStack}
                                </code>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => window.location.reload()} className="bg-midnight text-white px-8 py-3 rounded-xl font-bold hover:bg-gold hover:text-midnight transition-all shadow-lg">
                                Refresh StyleSwap
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }}
                                className="bg-white text-gray-500 border border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Clear Local Data & Reset
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function AppContent() {
    const { currentUser, loading, isAdmin, isSubAdmin, isUser, vendorProfileComplete } = useAuth();
    const { allProducts } = useProducts();
    const { cartCount } = useCart();
    const [authPage, setAuthPage] = useState('login');
    const [currentPage, setCurrentPage] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Derive unique categories from products, ensuring 'All' is first
    const uniqueCategories = React.useMemo(() => {
        if (!allProducts || !Array.isArray(allProducts)) return ['All'];
        const cats = new Set(allProducts.filter(Boolean).map(p => p.category).filter(Boolean));
        return ['All', ...Array.from(cats).sort()];
    }, [allProducts]);

    const getDefaultPage = (user) => {
        if (!user) return null;
        if (user.role === 'Admin') return 'dashboard';
        if (user.role === 'Sub-Admin') return 'dashboard';
        return 'catalog';
    };

    // If authenticated, we rely on getDefaultPage.
    // If NOT authenticated, we default to 'catalog' if currentPage is null.
    React.useEffect(() => {
        if (!currentUser && !currentPage && !loading) {
            setCurrentPage('catalog');
        }
    }, [currentUser, currentPage, loading]);

    React.useEffect(() => {
        if (currentUser && (!currentPage || currentPage === 'login' || currentPage === 'register')) {
            setCurrentPage(getDefaultPage(currentUser));
        }
    }, [currentUser]);

    // Handle Auth Requirement (from Child components)
    const handleRequireAuth = () => {
        setCurrentPage('login');
    };

    // -- Browser History Management --
    React.useEffect(() => {
        const handlePopState = (event) => {
            const state = event.state;
            if (state) {
                if (state.page) setCurrentPage(state.page);
                setSelectedProductId(state.productId !== undefined ? state.productId : null);
                setSelectedCategory(state.category || 'All');
                setSearchTerm(state.searchTerm || '');
            } else {
                // Fallback to initial state if no state in history
                setCurrentPage('catalog');
                setSelectedCategory('All');
                setSelectedProductId(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Push initial state if not already present
        if (!window.history.state) {
            window.history.replaceState({ page: 'catalog', category: 'All', productId: null, searchTerm: '' }, '');
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Helper to push state when navigating
    const pushNavigation = (page, category = selectedCategory, productId = selectedProductId, search = searchTerm) => {
        window.history.pushState({ page, category, productId, searchTerm: search }, '');
    };

    // Handle Product Click
    const handleProductClick = (product) => {
        if (!currentUser) {
            setCurrentPage('login');
            // No pushState for login redirect normally, or we could if we want to return
            return;
        }
        setSelectedProductId(product.id);
        setCurrentPage('product-details');
        pushNavigation('product-details', selectedCategory, product.id, searchTerm);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    if (loading) return <Loader message="Loading StyleSwap..." />;

    // Explicit Auth Pages
    if (!currentUser && (currentPage === 'login' || currentPage === 'register')) {
        return currentPage === 'login'
            ? <Login onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} />
            : <Register onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} />;
    }

    // Vendor with incomplete profile
    if (isSubAdmin && !vendorProfileComplete) {
        return <VendorOnboarding />;
    }

    const navigate = (page) => {
        const nextSearch = page !== 'catalog' ? '' : searchTerm;
        setCurrentPage(page);
        setSidebarOpen(false);
        if (page !== 'catalog') setSearchTerm('');
        pushNavigation(page, selectedCategory, selectedProductId, nextSearch);
    };

    const handleCategorySelect = (category) => {
        if (category === 'Customer Service') {
            navigate('contact');
            return;
        }
        setSelectedCategory(category);
        if (currentPage !== 'catalog') {
            setCurrentPage('catalog');
        }
        pushNavigation('catalog', category, null, '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPage = () => {
        // Shared Catalog rendering logic (Guests Only)
        const renderCatalog = (props = {}) => (
            <div className="space-y-6">
                <ProductCatalog
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    onProductClick={handleProductClick}
                    {...props}
                />
            </div>
        );

        if (isAdmin) return <AdminDashboard />;
        if (isSubAdmin) {
            switch (currentPage) {
                case 'dashboard': return <SalesAnalytics />;
                case 'products': return <ProductManagement />;
                case 'inventory': return <InventoryDashboard />;
                case 'rentals': return <ActiveRentals />;
                case 'analytics': return <SalesAnalytics />;
                default: return <SalesAnalytics />;
            }
        }

        if (isUser) {
            switch (currentPage) {
                case 'catalog': return renderCatalog({ onCategorySelect: handleCategorySelect });
                case 'product-details': return <ProductDetailsPage productId={selectedProductId} onBack={() => setCurrentPage('catalog')} />;
                case 'cart': return <CartPage onNavigate={navigate} />;
                case 'rentals': case 'orders': return <OrdersDashboard onNavigate={navigate} />;
                case 'profile': return <ProfileDashboard />;
                case 'wishlist': return <WishlistDashboard onNavigate={navigate} onProductClick={handleProductClick} />;
                default: return renderCatalog({ onCategorySelect: handleCategorySelect });
            }
        }

        // Guest pages
        switch (currentPage) {
            case 'catalog': return renderCatalog({ onCategorySelect: handleCategorySelect, onRequireAuth: handleRequireAuth });
            case 'contact': return <ContactUs />;
            default: return renderCatalog({ onCategorySelect: handleCategorySelect, onRequireAuth: handleRequireAuth });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header
                onMenuToggle={() => setSidebarOpen(v => !v)}
                cartCount={cartCount}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showSearch={true}
                categories={uniqueCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                currentPage={currentPage}
                onNavigate={navigate}
            />

            <div className="flex flex-1 max-w-screen-2xl mx-auto w-full relative">
                {/* Sidebar only for Management roles (Admin/Vendor) */}
                {(isAdmin || isSubAdmin) && (
                    <Sidebar
                        currentPage={currentPage}
                        onNavigate={navigate}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 w-full min-w-0">
                    {renderPage()}
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ToastProvider>
                    <UserProvider>
                        <ProductProvider>
                            <CartProvider>
                                <OrderProvider>
                                    <AppContent />
                                </OrderProvider>
                            </CartProvider>
                        </ProductProvider>
                    </UserProvider>
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
