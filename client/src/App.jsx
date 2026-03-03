import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { X } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { WishlistProvider } from './context/WishlistContext';

import Loader from './components/Shared/Loader';
import Header from './components/Shared/Header';
import Sidebar from './components/Shared/Sidebar';
import LaserLoader from './components/Shared/LaserLoader';
import Footer from './components/Shared/Footer';

// Auth
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));

// Admin
const Analytics = lazy(() => import('./components/Admin/Analytics'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./components/Admin/UserManagement'));
const ProductOverview = lazy(() => import('./components/Admin/ProductOverview'));
const SubscriberList = lazy(() => import('./components/Admin/SubscriberList'));
const AdminSettings = lazy(() => import('./components/Admin/AdminSettings'));

// SubAdmin
const ProductManagement = lazy(() => import('./components/SubAdmin/ProductManagement'));
const InventoryDashboard = lazy(() => import('./components/SubAdmin/InventoryDashboard'));
const SalesAnalytics = lazy(() => import('./components/SubAdmin/SalesAnalytics'));
const ActiveRentals = lazy(() => import('./components/SubAdmin/ActiveRentals'));
const VendorOnboarding = lazy(() => import('./components/SubAdmin/VendorOnboarding'));

// User
const ProductCatalog = lazy(() => import('./components/User/ProductCatalog'));
const CategoryRail = lazy(() => import('./components/User/Home/CategoryRail'));
const ProductDetailsPage = lazy(() => import('./components/User/ProductDetailsPage'));
const ProfileDashboard = lazy(() => import('./components/User/ProfileDashboard'));
const OrdersDashboard = lazy(() => import('./components/User/OrdersDashboard'));
const WishlistDashboard = lazy(() => import('./components/User/WishlistDashboard'));
const CartPage = lazy(() => import('./components/User/CartPage'));
const ContactUs = lazy(() => import('./components/User/ContactUs'));

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
    const [showPreloader, setShowPreloader] = useState(() => {
        // Only show preloader if it hasn't been shown in this session
        return !sessionStorage.getItem('loader-shown');
    });
    const [authPage, setAuthPage] = useState('login'); // 'login' | 'register' | 'forgot-password'
    const [currentPage, setCurrentPage] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProductId, setSelectedProductId] = useState(null);
    // Pending redirect: where to send user after login { page, productId }
    const [pendingRedirect, setPendingRedirect] = useState(null);

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
            if (pendingRedirect) {
                // Redirect to the page the user was trying to access before login
                setSelectedProductId(pendingRedirect.productId || null);
                setCurrentPage(pendingRedirect.page || getDefaultPage(currentUser));
                window.history.pushState(
                    { page: pendingRedirect.page, productId: pendingRedirect.productId, category: 'All', searchTerm: '' },
                    ''
                );
                setPendingRedirect(null);
            } else {
                setCurrentPage(getDefaultPage(currentUser));
            }
        }
    }, [currentUser, pendingRedirect]);

    // Handle Auth Requirement (from Child components)
    // redirectIntent: optional { page, productId } - where to go after login
    const handleRequireAuth = (redirectIntent) => {
        if (redirectIntent) setPendingRedirect(redirectIntent);
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
        setSelectedProductId(product.id);
        setCurrentPage('product-details');
        pushNavigation('product-details', selectedCategory, product.id, searchTerm);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    if (showPreloader) {
        return <LaserLoader onFadeOut={() => {
            setShowPreloader(false);
            sessionStorage.setItem('loader-shown', 'true');
        }} />;
    }

    if (loading) return <Loader message="Loading StyleSwap..." />;

    // Explicit Auth Pages
    if (!currentUser && (currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot-password')) {
        switch (currentPage) {
            case 'login': return <Suspense fallback={<Loader />}><Login onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} /></Suspense>;
            case 'register': return <Suspense fallback={<Loader />}><Register onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} /></Suspense>;
            case 'forgot-password': return <Suspense fallback={<Loader />}><ForgotPassword onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} /></Suspense>;
            default: return <Suspense fallback={<Loader />}><Login onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} /></Suspense>;
        }
    }

    // Vendor with incomplete profile
    if (isSubAdmin && !vendorProfileComplete) {
        return <Suspense fallback={<Loader />}><VendorOnboarding /></Suspense>;
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

        if (isAdmin) {
            switch (currentPage) {
                case 'dashboard': return <AdminDashboard onNavigate={navigate} />;
                case 'users': return <UserManagement />;
                case 'products': return <ProductOverview />;
                case 'analytics': return <Analytics onNavigate={navigate} />;
                case 'subscribers': return <SubscriberList />;
                case 'profile':
                case 'settings': return <AdminSettings />;
                default: return <AdminDashboard />;
            }
        }
        if (isSubAdmin) {
            switch (currentPage) {
                case 'dashboard': return <SalesAnalytics />;
                case 'products': return <ProductManagement />;
                case 'inventory': return <InventoryDashboard />;
                case 'rentals': return <ActiveRentals />;
                case 'analytics': return <SalesAnalytics />;
                case 'profile':
                case 'settings': return <AdminSettings />;
                default: return <SalesAnalytics />;
            }
        }

        if (isUser) {
            switch (currentPage) {
                case 'catalog': return renderCatalog({ onCategorySelect: handleCategorySelect });
                case 'product-details': return <ProductDetailsPage productId={selectedProductId} onBack={() => window.history.back()} onNavigate={navigate} onRequireAuth={handleRequireAuth} />;
                case 'cart': return <CartPage onNavigate={navigate} onProductClick={handleProductClick} />;
                case 'rentals': case 'orders': return <OrdersDashboard onNavigate={navigate} />;
                case 'profile': return <ProfileDashboard onNavigate={navigate} />;
                case 'wishlist': return <WishlistDashboard onNavigate={navigate} onProductClick={handleProductClick} />;
                default: return renderCatalog({ onCategorySelect: handleCategorySelect });
            }
        }

        // Guest pages
        switch (currentPage) {
            case 'catalog': return renderCatalog({ onCategorySelect: handleCategorySelect, onRequireAuth: handleRequireAuth });
            case 'product-details': return <ProductDetailsPage productId={selectedProductId} onBack={() => window.history.back()} onNavigate={navigate} onRequireAuth={handleRequireAuth} />;
            case 'contact': return <ContactUs />;
            default: return renderCatalog({ onCategorySelect: handleCategorySelect, onRequireAuth: handleRequireAuth });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-darkGray flex flex-col font-sans">
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
                onCartClick={() => navigate('cart')}
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
                    <Suspense fallback={<div className="h-full flex items-center justify-center p-8"><Loader message="Loading content..." /></div>}>
                        {renderPage()}
                    </Suspense>
                </main>
            </div>

            <Footer onNavigate={navigate} onCategorySelect={handleCategorySelect} />
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
                            <WishlistProvider>
                                <CartProvider>
                                    <OrderProvider>
                                        <AppContent />
                                    </OrderProvider>
                                </CartProvider>
                            </WishlistProvider>
                        </ProductProvider>
                    </UserProvider>
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
