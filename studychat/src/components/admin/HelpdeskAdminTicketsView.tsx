import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpdeskTicket,
  HelpdeskTechnician,
  HelpdeskDepartment,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  HELPDESK_DEPARTMENTS,
  HELPDESK_TECHNICIANS,
  getStoredHelpdeskTickets,
  saveStoredHelpdeskTickets
} from '../../data/helpdeskTicketsData';
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCheck,
  Building2,
  ShieldAlert,
  HardDrive,
  Cpu,
  BarChart3,
  FileText,
  BookOpen,
  User,
  Search,
  Filter,
  Plus,
  RotateCw,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  Lock,
  Send,
  History,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';

// ==========================================
// BADGE COMPONENTS (Wn & Un Exact Replica)
// ==========================================

export const PriorityBadge: React.FC<{
  priority: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}> = ({ priority, size = 'sm', showIcon = true, className = '' }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-2 py-0.5 text-[11px] gap-1';

  const renderIcon = () => {
    switch (priority) {
      case 'URGENT':
        return <Flame className="w-3 h-3 text-[#D92D20]" />;
      case 'HIGH':
        return <AlertTriangle className="w-3 h-3 text-[#F79009]" />;
      case 'MEDIUM':
        return <Clock className="w-3 h-3 text-[#2E90FA]" />;
      case 'LOW':
        return <CheckCircle2 className="w-3 h-3 text-[#667085]" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: cfg.badgeBg,
        borderColor: cfg.badgeBorder,
        color: cfg.badgeText,
      }}
    >
      {showIcon && renderIcon()}
      <span>{cfg.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ status, size = 'sm', className = '' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-xs gap-2' : 'px-2 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: cfg.badgeBg,
        borderColor: cfg.badgeBorder,
        color: cfg.badgeText,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.indicatorColor }}
        aria-hidden="true"
      />
      <span>{cfg.label}</span>
    </span>
  );
};

// ==========================================
// MAIN HELPDESK TICKETS VIEW
// ==========================================

export const HelpdeskAdminTicketsView: React.FC = () => {
  const { switchTab } = useStudyApp();

  // State Management
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => getStoredHelpdeskTickets());
  const [departments] = useState<HelpdeskDepartment[]>(HELPDESK_DEPARTMENTS);
  const [technicians] = useState<HelpdeskTechnician[]>(HELPDESK_TECHNICIANS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('niyam-theme') || localStorage.getItem('helpdesk360_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [techFilter, setTechFilter] = useState<string>('ALL');

  // Drawer & Modal State
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'overview' | 'discussion' | 'history'>('overview');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState<boolean>(false);

  // New Ticket Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('SOFTWARE');
  const [newPriority, setNewPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newDeptId, setNewDeptId] = useState(departments[0]?.id || '');
  const [newDescription, setNewDescription] = useState('');

  // Comment Form
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Theme Synchronizer
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('helpdesk360_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('helpdesk360_theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsQuickSearchOpen(false);
        setIsNewTicketModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.reporter.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesDept = deptFilter === 'ALL' || t.department?.id === deptFilter;
      const matchesTech =
        techFilter === 'ALL' ||
        (techFilter === 'UNASSIGNED' ? !t.assignedTechnician : t.assignedTechnician?.id === techFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesTech;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, deptFilter, techFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const urgent = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { total, inProgress, urgent, resolvedRate };
  }, [tickets]);

  // Actions
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTickets(getStoredHelpdeskTickets());
      setIsLoading(false);
    }, 450);
  };

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Department', 'Reporter', 'Assignee', 'Created At'];
    const rows = filteredTickets.map((t) => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.department?.name || 'Unassigned',
      t.reporter.name,
      t.assignedTechnician?.name || 'Unassigned',
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `helpdesk360_tickets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = (ticketId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    setTickets((prev) => {
      const next = prev.map((t) => {
        if (t.id === ticketId) {
          const updated: HelpdeskTicket = {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              {
                id: `sh-${Date.now()}`,
                previousStatus: t.status,
                newStatus,
                changedAt: new Date().toISOString(),
                changerName: 'Vikram Aditya (Admin)',
              },
              ...t.statusHistory,
            ],
          };
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(updated);
          }
          return updated;
        }
        return t;
      });
      saveStoredHelpdeskTickets(next);
      return next;
    });
  };

  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    const tech = technicians.find((x) => x.id === technicianId) || null;
    setTickets((prev) => {
      const next = prev.map((t) => {
        if (t.id === ticketId) {
          const updated: HelpdeskTicket = {
            ...t,
            assignedTechnicianId: tech ? tech.id : null,
            assignedTechnician: tech,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              {
                id: `sh-${Date.now()}`,
                previousStatus: t.assignedTechnician ? t.assignedTechnician.name : 'Unassigned',
                newStatus: tech ? `Assigned to ${tech.name}` : 'Unassigned',
                changedAt: new Date().toISOString(),
                changerName: 'Vikram Aditya (Admin)',
              },
              ...t.statusHistory,
            ],
          };
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(updated);
          }
          return updated;
        }
        return t;
      });
      saveStoredHelpdeskTickets(next);
      return next;
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: {
        name: 'Vikram Aditya',
        role: 'ADMIN',
      },
      content: commentText.trim(),
      isInternal: isInternalComment,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => {
      const next = prev.map((t) => {
        if (t.id === selectedTicket.id) {
          const updated: HelpdeskTicket = {
            ...t,
            comments: [...t.comments, newComment],
            updatedAt: new Date().toISOString(),
          };
          setSelectedTicket(updated);
          return updated;
        }
        return t;
      });
      saveStoredHelpdeskTickets(next);
      return next;
    });

    setCommentText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dept = departments.find((d) => d.id === newDeptId) || departments[0] || null;
    const maxNum = tickets.reduce((max, t) => {
      const num = parseInt(t.ticketNumber.replace(/\D/g, ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 1053);

    const newTicket: HelpdeskTicket = {
      id: `cmw-${Date.now()}`,
      ticketNumber: `HD-${maxNum + 1}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Created from administrative directory portal.',
      category: newCategory,
      priority: newPriority,
      status: 'OPEN',
      reporterId: 'admin-vikram',
      assignedTechnicianId: null,
      departmentId: dept ? dept.id : null,
      slaDeadline: new Date(Date.now() + (newPriority === 'URGENT' ? 4 : newPriority === 'HIGH' ? 8 : 24) * 3600000).toISOString(),
      firstResponseDeadline: new Date(Date.now() + 2 * 3600000).toISOString(),
      firstResponseAt: null,
      resolvedAt: null,
      isEscalated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reporter: {
        id: 'admin-vikram',
        name: 'Vikram Aditya',
        email: 'admin@helpdesk.local',
      },
      assignedTechnician: null,
      department: dept,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: { name: 'Vikram Aditya', role: 'ADMIN' },
          content: 'Ticket created and dispatched into support queue.',
          isInternal: true,
          createdAt: new Date().toISOString(),
        },
      ],
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          previousStatus: 'NEW',
          newStatus: 'OPEN',
          changedAt: new Date().toISOString(),
          changerName: 'Vikram Aditya',
        },
      ],
    };

    setTickets((prev) => {
      const next = [newTicket, ...prev];
      saveStoredHelpdeskTickets(next);
      return next;
    });

    setIsNewTicketModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setSelectedTicket(newTicket);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDeptFilter('ALL');
    setTechFilter('ALL');
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || deptFilter !== 'ALL' || techFilter !== 'ALL';

  return (
    <div className="min-h-screen bg-background text-text-primary antialiased font-sans flex transition-colors duration-200 selection:bg-brand-light selection:text-brand">
      {/* ======================================================== */}
      {/* 1. COLLAPSIBLE ENTERPRISE SIDEBAR                       */}
      {/* ======================================================== */}
      <aside
        className={`h-screen sticky top-0 flex flex-col justify-between bg-sidebar-bg border-r border-sidebar-border transition-all duration-200 z-40 select-none shadow-xs ${
          isSidebarCollapsed ? 'w-16' : 'w-60'
        } hidden md:flex flex-shrink-0`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-14 flex items-center justify-between px-3.5 border-b border-sidebar-border flex-shrink-0 bg-surface">
            <div className="flex items-center gap-2.5 overflow-hidden cursor-pointer" onClick={() => handleRefresh()}>
              <div className="relative w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden p-0.5">
                <div className="w-full h-full rounded bg-brand/10 text-brand flex items-center justify-center font-black text-xs font-mono">
                  H3
                </div>
                <span className="live-indicator-dot absolute -top-1 -right-1" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[13px] tracking-tight text-text-primary whitespace-nowrap">
                      Handoff <span className="text-brand">360</span>
                    </span>
                    <span className="brand-tag">v2.4</span>
                  </div>
                  <span className="text-[10px] text-text-muted font-medium truncate uppercase tracking-wider">
                    Complaint App
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer border border-transparent hover:border-border"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-3 overflow-y-auto flex-1 scrollbar-thin" aria-label="Main Navigation">
            {/* Operations */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-extrabold tracking-wider text-text-muted uppercase">
                  OPERATIONS
                </div>
              )}
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                onClick={() => {}}
              >
                <LayoutDashboard className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-brand/10 dark:bg-brand/20 text-brand border-l-[3px] border-brand shadow-xs transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <Ticket className="w-4 h-4 text-brand" />
                {!isSidebarCollapsed && <span className="truncate">All tickets</span>}
              </div>
            </div>

            {/* Administration */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 pt-2 pb-1 text-[10px] font-extrabold tracking-wider text-text-muted uppercase">
                  ADMINISTRATION
                </div>
              )}
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <Users className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">User directory</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <UserCheck className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">Technicians</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <Building2 className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">Departments</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">SLA policies</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <HardDrive className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">IT assets</span>}
              </div>
            </div>

            {/* Intelligence */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 pt-2 pb-1 text-[10px] font-extrabold tracking-wider text-text-muted uppercase">
                  INTELLIGENCE
                </div>
              )}
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <Cpu className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">Automations</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <BarChart3 className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">Analytics</span>}
              </div>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <FileText className="w-4 h-4 text-text-muted" />
                {!isSidebarCollapsed && <span className="truncate">Audit logs</span>}
              </div>
            </div>

            {/* Switch to Dharya */}
            <div className="pt-2 mt-2 border-t border-border">
              <button
                type="button"
                onClick={() => switchTab('chat')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                title="Return to Dharya Space"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Dharya Space</span>}
              </button>
            </div>
          </nav>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-sidebar-border bg-surface flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 text-brand font-bold text-xs flex items-center justify-center shrink-0">
              VA
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-text-primary truncate">Vikram Aditya</div>
                <div className="text-[10px] text-text-muted font-mono truncate">LEVEL 4 · ADMIN</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN APP SHELL & CONTENT                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Sticky Header */}
        <header className="h-14 bg-header-bg backdrop-blur-md border-b border-header-border sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary transition-colors cursor-pointer flex-shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Quick Search Input with Cmd+K */}
            <button
              type="button"
              onClick={() => setIsQuickSearchOpen(true)}
              className="w-full h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text-muted hover:text-text-primary text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer text-left"
              aria-label="Quick search tickets"
            >
              <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <span className="truncate">Quick search (Ticket ID, subject)...</span>
              <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-muted border border-border text-text-muted hidden sm:inline-block">
                ⌘K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-text-secondary hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full" />
            </button>

            {/* Quick Link to Private Dharya Space */}
            <button
              type="button"
              onClick={() => switchTab('chat')}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Back to Dharya</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
          {/* Breadcrumbs & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1 font-mono">
                <span className="hover:text-brand cursor-pointer">Admin</span>
                <span>/</span>
                <span className="text-text-primary font-medium">All Tickets</span>
              </div>
              <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-snug">
                Master Ticket Directory
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Global administrative inspection of all enterprise incident and service requests.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-muted text-text-secondary text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Refresh Tickets"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-muted text-text-secondary text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-brand hover:bg-[#0F46A3] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Total Tickets</span>
                <Ticket className="w-4 h-4 text-text-muted" />
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary mt-2">{stats.total}</div>
              <div className="text-[11px] text-text-muted mt-1">Across all departments</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">In Progress</span>
                <Clock className="w-4 h-4 text-[#F79009]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#F79009] mt-2">{stats.inProgress}</div>
              <div className="text-[11px] text-text-muted mt-1">Actively assigned to techs</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">High & Urgent</span>
                <AlertTriangle className="w-4 h-4 text-[#D92D20]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#D92D20] mt-2">{stats.urgent}</div>
              <div className="text-[11px] text-text-muted mt-1">SLA critical priority</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Resolution Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.resolvedRate}%
              </div>
              <div className="text-[11px] text-text-muted mt-1">Target benchmark: 95%</div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-3 rounded-lg border border-border bg-surface flex flex-wrap items-center gap-3 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tickets by ID, title, or reporter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-surface-muted focus:bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Department Dropdown */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Technician Dropdown */}
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand shadow-xs cursor-pointer"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 rounded-md text-xs text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Master Tickets Data Table */}
          <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-16 text-center">
                <RotateCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
                <p className="text-xs text-text-muted">Loading all enterprise tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-16 text-center">
                <Ticket className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-text-primary">No tickets found</p>
                <p className="text-xs text-text-muted mt-1">Try adjusting your search queries or filter dropdowns.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-3 px-3 py-1.5 rounded-md bg-brand text-white text-xs font-medium cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-border">
                  <thead className="bg-[#F9FAFB] dark:bg-surface-muted text-text-secondary font-medium">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Title &amp; Category</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Reporter</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">SLA Due</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {filteredTickets.map((t) => {
                      const isSlaBreached =
                        t.slaDeadline &&
                        new Date(t.slaDeadline).getTime() < Date.now() &&
                        !['RESOLVED', 'CLOSED'].includes(t.status);

                      return (
                        <tr
                          key={t.id}
                          onClick={() => {
                            setSelectedTicket(t);
                            setActiveDrawerTab('overview');
                          }}
                          className="hover:bg-[#F9FAFB] dark:hover:bg-surface-hover transition-colors cursor-pointer group"
                        >
                          {/* Ticket ID */}
                          <td className="px-4 py-3 font-mono font-bold text-brand whitespace-nowrap">
                            {t.ticketNumber}
                          </td>

                          {/* Title & Category */}
                          <td className="px-4 py-3 min-w-[220px]">
                            <div className="font-semibold text-text-primary group-hover:text-brand transition-colors line-clamp-1">
                              {t.title}
                            </div>
                            <div className="text-[11px] text-text-muted capitalize">
                              {t.category ? t.category.toLowerCase() : 'support'}
                            </div>
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                            {t.department?.name || <span className="text-text-muted">—</span>}
                          </td>

                          {/* Reporter */}
                          <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{t.reporter.name}</td>

                          {/* Assignee */}
                          <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                            {t.assignedTechnician ? (
                              <span>{t.assignedTechnician.name}</span>
                            ) : (
                              <span className="text-[#F79009] font-medium text-[11px] px-1.5 py-0.5 rounded bg-[#FEF0C7]/60 dark:bg-[#451A03]/60">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Priority Badge */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <PriorityBadge priority={t.priority} />
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={t.status} />
                          </td>

                          {/* SLA Due */}
                          <td className="px-4 py-3 text-[11px] whitespace-nowrap font-mono">
                            {t.slaDeadline ? (
                              <span
                                className={`flex items-center gap-1 ${
                                  isSlaBreached ? 'text-[#D92D20] font-bold' : 'text-text-muted'
                                }`}
                              >
                                {isSlaBreached && <AlertCircle className="w-3 h-3 text-[#D92D20]" />}
                                {new Date(t.slaDeadline).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </td>

                          {/* Action Arrow */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand inline-block transition-transform group-hover:translate-x-0.5" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* 3. TICKET DETAIL SLIDE-OVER DRAWER                       */}
      {/* ======================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl h-full bg-surface border-l border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-start justify-between gap-3 bg-surface-muted/40">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono font-bold text-sm text-brand">{selectedTicket.ticketNumber}</span>
                  <PriorityBadge priority={selectedTicket.priority} size="sm" />
                  <StatusBadge status={selectedTicket.status} size="sm" />
                </div>
                <h2 className="text-base font-bold text-text-primary leading-snug line-clamp-2">
                  {selectedTicket.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Progression Bar */}
            <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as any)}
                  className="px-2.5 py-1 rounded border border-border bg-surface text-text-primary font-medium text-xs focus:ring-1 focus:ring-brand focus:outline-none cursor-pointer"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">Assign:</span>
                <select
                  value={selectedTicket.assignedTechnicianId || ''}
                  onChange={(e) => handleAssignTechnician(selectedTicket.id, e.target.value)}
                  className="px-2.5 py-1 rounded border border-border bg-surface text-text-primary font-medium text-xs focus:ring-1 focus:ring-brand focus:outline-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="px-5 border-b border-border flex items-center gap-4 bg-surface text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveDrawerTab('overview')}
                className={`py-3 border-b-2 transition-colors cursor-pointer ${
                  activeDrawerTab === 'overview'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveDrawerTab('discussion')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDrawerTab === 'discussion'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <span>Discussion</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-muted text-text-muted">
                  {selectedTicket.comments?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDrawerTab('history')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDrawerTab === 'history'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <span>Activity History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-muted text-text-muted">
                  {selectedTicket.statusHistory?.length || 0}
                </span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {activeDrawerTab === 'overview' && (
                <>
                  {/* Description Box */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Description</h3>
                    <div className="p-3.5 rounded-lg border border-border bg-surface-muted/50 text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-surface">
                      <span className="text-text-muted block text-[11px] mb-1">Reporter</span>
                      <span className="font-semibold text-text-primary block">{selectedTicket.reporter.name}</span>
                      <span className="text-[11px] text-text-muted block truncate font-mono">
                        {selectedTicket.reporter.email}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-surface">
                      <span className="text-text-muted block text-[11px] mb-1">Department</span>
                      <span className="font-semibold text-text-primary block">
                        {selectedTicket.department?.name || 'Unassigned'}
                      </span>
                      <span className="text-[11px] text-text-muted block">Internal Division</span>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-surface">
                      <span className="text-text-muted block text-[11px] mb-1">Created At</span>
                      <span className="font-semibold text-text-primary font-mono block">
                        {new Date(selectedTicket.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-surface">
                      <span className="text-text-muted block text-[11px] mb-1">SLA Target</span>
                      <span className="font-semibold text-text-primary font-mono block">
                        {selectedTicket.slaDeadline
                          ? new Date(selectedTicket.slaDeadline).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Standard 24h'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeDrawerTab === 'discussion' && (
                <div className="space-y-4">
                  {/* Comments Thread */}
                  <div className="space-y-3">
                    {selectedTicket.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg border text-xs ${
                          comment.isInternal
                            ? 'bg-amber-500/5 border-amber-500/20 text-text-primary'
                            : 'bg-surface border-border text-text-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{comment.author.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-muted text-text-muted font-mono">
                              {comment.author.role}
                            </span>
                            {comment.isInternal && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
                                <Lock className="w-2.5 h-2.5" /> Internal Note
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">Add Note / Comment</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-text-muted hover:text-text-primary">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded border-border text-brand focus:ring-brand"
                        />
                        <span>Private Internal Note</span>
                      </label>
                    </div>

                    <textarea
                      rows={3}
                      placeholder={
                        isInternalComment ? 'Add private internal technician note...' : 'Write comment to user...'
                      }
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:ring-1 focus:ring-brand focus:outline-none resize-none"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-4 py-1.5 rounded-md bg-brand hover:bg-[#0F46A3] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeDrawerTab === 'history' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Full Chronological Audit Log
                  </h3>
                  <div className="relative border-l-2 border-border pl-4 space-y-4 text-xs">
                    {selectedTicket.statusHistory?.map((hist) => (
                      <div key={hist.id} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand ring-4 ring-surface" />
                        <div className="font-semibold text-text-primary">
                          {hist.previousStatus} &rarr; {hist.newStatus}
                        </div>
                        <div className="text-[11px] text-text-muted flex items-center gap-2 mt-0.5 font-mono">
                          <span>{hist.changerName}</span>
                          <span>&bull;</span>
                          <span>{new Date(hist.changedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. NEW TICKET MODAL DIALOG                               */}
      {/* ======================================================== */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-muted/30">
              <h3 className="font-bold text-sm text-text-primary">Create New Incident / Ticket</h3>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Ticket Title / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production API latency degradation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                  >
                    <option value="SOFTWARE">Software</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="NETWORK">Network</option>
                    <option value="ACCESS">Access &amp; Security</option>
                    <option value="FACILITY">Facility</option>
                    <option value="OTHER">Other Query</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-primary mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                  >
                    <option value="URGENT">Urgent (4h SLA)</option>
                    <option value="HIGH">High (8h SLA)</option>
                    <option value="MEDIUM">Medium (24h SLA)</option>
                    <option value="LOW">Low (72h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Target Department</label>
                <select
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Issue Description &amp; Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe the incident, error symptoms, impact, and reproduction steps..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 rounded-md bg-brand hover:bg-[#0F46A3] disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. QUICK SEARCH (CMD+K) MODAL DIALOG                     */}
      {/* ======================================================== */}
      {isQuickSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsQuickSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-border flex items-center gap-2.5 bg-surface">
              <Search className="w-4 h-4 text-brand flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search tickets by ID, title, requester, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-text-primary bg-transparent focus:outline-none"
              />
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                ESC
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border text-xs">
              {filteredTickets.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setIsQuickSearchOpen(false);
                  }}
                  className="p-3 hover:bg-[#F9FAFB] dark:hover:bg-surface-hover cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-brand">{t.ticketNumber}</span>
                      <PriorityBadge priority={t.priority} size="sm" />
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <div className="font-semibold text-text-primary truncate">{t.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand flex-shrink-0" />
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="p-8 text-center text-text-muted text-xs">No matching tickets found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
