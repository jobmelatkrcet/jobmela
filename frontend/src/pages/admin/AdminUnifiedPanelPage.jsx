import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  DoorClosed,
  Users,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import roomService from '../../services/roomService';

import AdminDashboardPage from './AdminDashboardPage';
import AdminCompaniesPage from './AdminCompaniesPage';
import AdminRoomAllocationPage from './AdminRoomAllocationPage';
import AdminStudentsPage from './AdminStudentsPage';
import AdminRequirementsPage from './AdminRequirementsPage';

const TABS = [
  {
    id: 'overview',
    label: 'Overview & Analytics',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
    description: 'Event metrics, student applications & top recruiters',
  },
  {
    id: 'companies',
    label: 'Companies & Excel Upload',
    shortLabel: 'Companies',
    icon: Building2,
    description: 'Upload companies Excel, manage vacancies & export data',
  },
  {
    id: 'rooms',
    label: 'Room Allocation & QR Codes',
    shortLabel: 'Room Allocation',
    icon: DoorClosed,
    description: 'Upload room Excel, sequential auto-allocation & printable QR placards',
  },
  {
    id: 'students',
    label: 'Students Directory',
    shortLabel: 'Students',
    icon: Users,
    description: 'Registered candidates, branch filters & hall ticket records',
  },
  {
    id: 'requirements',
    label: 'Placement Requirements',
    shortLabel: 'Requirements',
    icon: ClipboardList,
    description: 'Document criteria, eligibility matrices & guidelines',
  },
];

const AdminUnifiedPanelPage = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current active tab
  const getInitialTab = () => {
    if (initialTab) return initialTab;
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some((t) => t.id === tabParam)) return tabParam;
    if (location.pathname.includes('/rooms')) return 'rooms';
    if (location.pathname.includes('/companies')) return 'companies';
    if (location.pathname.includes('/students')) return 'students';
    if (location.pathname.includes('/requirements')) return 'requirements';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [counts, setCounts] = useState({
    companies: null,
    students: null,
    rooms: null,
  });

  // Sync tab with URL / route
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some((t) => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [searchParams, initialTab]);

  // Load badge counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [dashData, roomData] = await Promise.allSettled([
          adminService.getDashboard(),
          roomService.getSummary(),
        ]);
        setCounts({
          companies: dashData.status === 'fulfilled' ? dashData.value?.total_companies : null,
          students: dashData.status === 'fulfilled' ? dashData.value?.total_students : null,
          rooms: roomData.status === 'fulfilled' ? roomData.value?.summary?.total_rooms : null,
        });
      } catch (e) {
        console.error('Failed to load tab counts:', e);
      }
    };
    fetchCounts();
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Stay in /admin with tab param so everything remains in the unified Admin Panel
    navigate(`/admin?tab=${tabId}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="admin-unified-panel">
      {/* Tab Navigation Header Bar */}
      <div className="app-container admin-unified-nav-container">
        <div className="admin-tabs-bar" role="tablist" aria-label="Admin Navigation Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            let badge = null;
            if (tab.id === 'companies' && counts.companies !== null) {
              badge = counts.companies;
            } else if (tab.id === 'students' && counts.students !== null) {
              badge = counts.students;
            } else if (tab.id === 'rooms' && counts.rooms !== null) {
              badge = `${counts.rooms} Rms`;
            }

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`admin-tab-item ${isActive ? 'active' : ''}`}
                title={tab.description}
              >
                <Icon size={17} />
                <span>{tab.shortLabel}</span>
                {badge !== null && (
                  <span className="admin-tab-counter">{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub-Panel */}
      <div className="admin-tab-content-area">
        {activeTab === 'overview' && (
          <AdminDashboardPage onTabChange={handleTabChange} />
        )}
        {activeTab === 'companies' && (
          <AdminCompaniesPage onTabChange={handleTabChange} />
        )}
        {activeTab === 'rooms' && (
          <AdminRoomAllocationPage onTabChange={handleTabChange} />
        )}
        {activeTab === 'students' && (
          <AdminStudentsPage onTabChange={handleTabChange} />
        )}
        {activeTab === 'requirements' && (
          <AdminRequirementsPage onTabChange={handleTabChange} />
        )}
      </div>
    </div>
  );
};

export default AdminUnifiedPanelPage;
