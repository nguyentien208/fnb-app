import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { CustomerApp } from './features/customer/CustomerApp';
import { PosApp } from './features/pos/PosApp';
import { KdsApp } from './features/kds/KdsApp';
import { AdminApp } from './features/admin/AdminApp';
import { RoleGuard } from './components/RoleGuard';
import { useFnBStore } from './stores/useFnBStore';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'customer' | 'pos' | 'kds' | 'admin'>('customer');
  const [isDirectQrScan, setIsDirectQrScan] = useState<boolean>(false);
  const [scannedTableId, setScannedTableId] = useState<string | null>(null);

  const { tables, openTableSession, initRealtimeSync, isRealtimeConnected } = useFnBStore();

  // Initialize Realtime WebSocket Connection
  useEffect(() => {
    initRealtimeSync();
  }, [initRealtimeSync]);

  // Detect direct QR Scan from URL parameters or hash
  useEffect(() => {
    const handleUrlRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const qToken = urlParams.get('q');
      const tableIdParam = urlParams.get('table');

      // Also check hash route like #/q/token-table-a01-sec789
      const hash = window.location.hash;
      let matchedToken = qToken;

      if (!matchedToken && hash.includes('/q/')) {
        matchedToken = hash.split('/q/')[1];
      }

      if (matchedToken) {
        const matchedTable = tables.find(t => t.qrToken === matchedToken || t.id === matchedToken);
        if (matchedTable) {
          setIsDirectQrScan(true);
          setScannedTableId(matchedTable.id);
          setCurrentTab('customer');
          openTableSession(matchedTable.id);
        }
      } else if (tableIdParam) {
        const matchedTable = tables.find(t => t.id === tableIdParam);
        if (matchedTable) {
          setIsDirectQrScan(true);
          setScannedTableId(matchedTable.id);
          setCurrentTab('customer');
          openTableSession(matchedTable.id);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, [tables, openTableSession]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Show Staff HeaderNav only when NOT in direct customer QR scan mode */}
      {!isDirectQrScan && (
        <HeaderNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      {/* If scanned direct QR code, show a clean top bar indicating the table */}
      {isDirectQrScan && (
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">Thực Đơn Đặt Món Tại Bàn</span>
              <span className="text-[10px] text-slate-400">Saigon Bistro • Phục Vụ Tại Bàn</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-xl">
            Thực Đơn Điện Tử
          </span>
        </header>
      )}

      <main className="flex-1">
        {currentTab === 'customer' && (
          <RoleGuard allowedRoles={['CUSTOMER', 'WAITER', 'CASHIER', 'BRANCH_MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN']}>
            <CustomerApp initialTableId={scannedTableId || undefined} isDirectScan={isDirectQrScan} />
          </RoleGuard>
        )}

        {currentTab === 'pos' && (
          <RoleGuard
            allowedRoles={['CASHIER', 'WAITER', 'BRANCH_MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN']}
            fallbackTab={() => setCurrentTab('customer')}
          >
            <PosApp />
          </RoleGuard>
        )}

        {currentTab === 'kds' && (
          <RoleGuard
            allowedRoles={['KITCHEN', 'BRANCH_MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN']}
            fallbackTab={() => setCurrentTab('customer')}
          >
            <KdsApp />
          </RoleGuard>
        )}

        {currentTab === 'admin' && (
          <RoleGuard
            allowedRoles={['BRANCH_MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN']}
            fallbackTab={() => setCurrentTab('customer')}
          >
            <AdminApp />
          </RoleGuard>
        )}
      </main>
    </div>
  );
};

export default App;
