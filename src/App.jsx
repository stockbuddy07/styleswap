import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { ProductProvider } from './context/ProductContext';
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
import CartPage from './components/User/CartPage';
import MyRentals from './components/User/MyRentals';

function AppContent() {
    const { currentUser, loading, isAdmin, isSubAdmin, isUser, vendorProfileComplete } = useAuth();
    const { cartCount } = useCart();
    const [authPage, setAuthPage] = useState('login');
    const [currentPage, setCurrentPage] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
        if (currentUser && !currentPage) {
            setCurrentPage(getDefaultPage(currentUser));
        }
        if (!currentUser) {
            setCurrentPage(null);
        }
    }, [currentUser]);

    if (loading) return <Loader message="Loading StyleSwap..." />;

    // Handle Auth Requirement (from Child components)
    const handleRequireAuth = () => {
        setAuthPage('login');
        // We show the auth screen by setting a temporary state or modal?
        // Current implementation uses `if (!currentUser) return <Login ... />`
        // We need to change that.
        // Let's us a specific "auth" Page or overlay.
        // For simplicity, let's just use a state to show the Modal OVER the app if needed,
        // OR just switch the view if we want to keep it simple.

        // Actually, looking at lines 60-64, it completely replaces the app.
        // Let's keep that behavior IF the user explicitly asks for login.
        // But how do we trigger it?
        // We can add a 'login' and 'register' page to renderPage?
    };

    if (loading) return <Loader message="Loading StyleSwap..." />;

    // Explicit Auth Pages (if user clicked "Sign In" / "Join Now" from Header)
    if (!currentUser && (currentPage === 'login' || currentPage === 'register')) {
        return currentPage === 'login'
            ? <Login onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} />
            : <Register onNavigate={(p) => p === 'home' ? setCurrentPage('catalog') : setCurrentPage(p)} />;
    }

    // Vendor with incomplete profile → show full-screen onboarding
    if (isSubAdmin && !vendorProfileComplete) {
        return <VendorOnboarding />;
    }

    const navigate = (page) => {
        setCurrentPage(page);
        setSidebarOpen(false);
        if (page !== 'catalog') setSearchTerm('');
    };

    const renderPage = () => {
        // Admin pages
        if (isAdmin) {
            switch (currentPage) {
                case 'dashboard': return <AdminDashboard />;
                case 'analytics': return <Analytics />;
                case 'users': return <UserManagement />;
                case 'products': return <ProductOverview />;
                default: return <AdminDashboard />;
            }
        }
        // Sub-Admin pages
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
        // User pages
        if (isUser) {
            switch (currentPage) {
                case 'catalog': return <ProductCatalog searchTerm={searchTerm} />;
                case 'cart': return <CartPage onNavigate={navigate} />;
                case 'rentals': return <MyRentals onNavigate={navigate} />;
                default: return <ProductCatalog searchTerm={searchTerm} />;
            }
        }

        // Guest pages (Default)
        switch (currentPage) {
            case 'catalog': return <ProductCatalog searchTerm={searchTerm} onRequireAuth={() => setCurrentPage('login')} />;

            // Render Modals OVER the Catalog
            case 'login': return (
                <>
                    <ProductCatalog searchTerm={searchTerm} />
                    <Login
                        onNavigate={(p) => setCurrentPage(p === 'register' ? 'register' : 'catalog')}
                        onClose={() => setCurrentPage('catalog')}
                    />
                </>
            );
            case 'register': return (
                <>
                    <ProductCatalog searchTerm={searchTerm} />
                    <Register
                        onNavigate={(p) => setCurrentPage(p === 'login' ? 'login' : 'catalog')}
                        onClose={() => setCurrentPage('catalog')}
                    />
                </>
            );

            // If guest tries to access protected pages, redirect to login
            case 'cart':
            case 'rentals':
                setTimeout(() => setCurrentPage('login'), 0);
                return <Loader message="Redirecting to Login..." />;
            default: return <ProductCatalog searchTerm={searchTerm} onRequireAuth={() => setCurrentPage('login')} />;
        }
    };

    return (
        <div className="min-h-screen bg-offWhite">
            <Header
                onMenuToggle={() => setSidebarOpen(v => !v)}
                cartCount={cartCount}
                onCartClick={isUser ? () => navigate('cart') : undefined}
                searchTerm={searchTerm}
                onSearchChange={isUser ? setSearchTerm : undefined}
                showSearch={isUser}
                currentPage={currentPage}
                onNavigate={navigate}
            />
            <div className="flex">
                <Sidebar
                    currentPage={currentPage}
                    onNavigate={navigate}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
                    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
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
    );
}
