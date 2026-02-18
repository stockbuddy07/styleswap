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

    React.useEffect(() => {
        if (currentUser && !currentPage) {
            setCurrentPage(getDefaultPage(currentUser));
        }
        if (!currentUser) {
            setCurrentPage(null);
        }
    }, [currentUser]);

    if (loading) return <Loader message="Loading StyleSwap..." />;

    // Not authenticated → show login/register
    if (!currentUser) {
        return authPage === 'login'
            ? <Login onNavigate={setAuthPage} />
            : <Register onNavigate={setAuthPage} />;
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
        return null;
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
