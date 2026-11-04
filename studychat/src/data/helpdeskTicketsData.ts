/**
 * HelpDesk 360 Enterprise Ticket Data & Design System Config
 * Authentic replica from https://helpdesk-360.vercel.app/admin/tickets
 */

export interface HelpdeskReporter {
  id: string;
  name: string;
  email: string;
}

export interface HelpdeskTechnician {
  id: string;
  technicianId?: string;
  name: string;
  email: string;
  departmentId?: string;
  [key: string]: any;
}

export interface HelpdeskDepartment {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface TicketComment {
  id: string;
  author: {
    name: string;
    role: string;
  };
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketStatusHistory {
  id: string;
  previousStatus: string;
  newStatus: string;
  changedAt: string;
  changerName: string;
}

export interface HelpdeskTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'SOFTWARE' | 'HARDWARE' | 'NETWORK' | 'ACCESS' | 'FACILITY' | 'OTHER' | string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reporterId: string;
  assignedTechnicianId: string | null;
  departmentId: string | null;
  slaDeadline: string | null;
  firstResponseDeadline: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
  reporter: HelpdeskReporter;
  assignedTechnician: HelpdeskTechnician | null;
  department: HelpdeskDepartment | null;
  comments: TicketComment[];
  statusHistory: TicketStatusHistory[];
}

export const PRIORITY_CONFIG: Record<string, {
  label: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  slaHours: number;
  warningHours: number;
}> = {
  URGENT: {
    label: "Urgent",
    description: "System completely down or critical business operation halted",
    color: "#D92D20",
    badgeBg: "#FEF3F2",
    badgeBorder: "#FECDCA",
    badgeText: "#B42318",
    slaHours: 4,
    warningHours: 3
  },
  HIGH: {
    label: "High",
    description: "Significant business degradation with no immediate workaround",
    color: "#F79009",
    badgeBg: "#FFFAEB",
    badgeBorder: "#FEDF89",
    badgeText: "#B54708",
    slaHours: 8,
    warningHours: 6
  },
  MEDIUM: {
    label: "Medium",
    description: "Non-critical problem impacting standard productivity",
    color: "#2E90FA",
    badgeBg: "#EFF8FF",
    badgeBorder: "#B2DDFF",
    badgeText: "#175CD3",
    slaHours: 24,
    warningHours: 18
  },
  LOW: {
    label: "Low",
    description: "Inconvenience or query with negligible workflow impact",
    color: "#667085",
    badgeBg: "#F8F9FC",
    badgeBorder: "#EAECF0",
    badgeText: "#344054",
    slaHours: 72,
    warningHours: 48
  }
};

export const STATUS_CONFIG: Record<string, {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  indicatorColor: string;
}> = {
  OPEN: {
    label: "Open",
    badgeBg: "#EFF8FF",
    badgeBorder: "#B2DDFF",
    badgeText: "#175CD3",
    indicatorColor: "#2E90FA"
  },
  IN_PROGRESS: {
    label: "In progress",
    badgeBg: "#FEF0C7",
    badgeBorder: "#FEDF89",
    badgeText: "#B54708",
    indicatorColor: "#F79009"
  },
  RESOLVED: {
    label: "Resolved",
    badgeBg: "#ECFDF3",
    badgeBorder: "#A6F4C5",
    badgeText: "#027A48",
    indicatorColor: "#12B76A"
  },
  CLOSED: {
    label: "Closed",
    badgeBg: "#F2F4F7",
    badgeBorder: "#D0D5DD",
    badgeText: "#344054",
    indicatorColor: "#667085"
  }
};

export const HELPDESK_DEPARTMENTS: HelpdeskDepartment[] = [
  {
    "id": "cmv9lzg0o0006qcbewovx9o0x",
    "name": "Administration",
    "description": "Executive and operational administrative support.",
    "isActive": true,
    "userCount": 1,
    "ticketCount": 0,
    "assetCount": 0,
    "createdAt": "2026-10-15T14:03:03.768Z",
    "updatedAt": "2026-11-03T06:34:25.145Z"
  },
  {
    "id": "cmv9lzfzp0002qcbefsqqtwsy",
    "name": "Finance",
    "description": "Accounting, payroll, and financial operations.",
    "isActive": true,
    "userCount": 1,
    "ticketCount": 4,
    "assetCount": 1,
    "createdAt": "2026-10-15T14:03:03.734Z",
    "updatedAt": "2026-11-03T06:34:25.129Z"
  },
  {
    "id": "cmv9lzfzi0001qcbetknpva8l",
    "name": "Human Resources",
    "description": "People operations, talent, and onboarding.",
    "isActive": true,
    "userCount": 1,
    "ticketCount": 5,
    "assetCount": 1,
    "createdAt": "2026-10-15T14:03:03.726Z",
    "updatedAt": "2026-11-03T06:34:25.125Z"
  },
  {
    "id": "cmv9lzfyh0000qcbeitp15jsv",
    "name": "Information Technology",
    "description": "Core IT infrastructure, hardware, and systems.",
    "isActive": true,
    "userCount": 5,
    "ticketCount": 0,
    "assetCount": 1,
    "createdAt": "2026-10-15T14:03:03.686Z",
    "updatedAt": "2026-11-03T06:34:25.119Z"
  },
  {
    "id": "cmv9lzg0f0005qcbegaj6kv5g",
    "name": "Marketing",
    "description": "Brand, growth, and communications.",
    "isActive": true,
    "userCount": 0,
    "ticketCount": 0,
    "assetCount": 0,
    "createdAt": "2026-10-15T14:03:03.759Z",
    "updatedAt": "2026-11-03T06:34:25.140Z"
  },
  {
    "id": "cmv9lzfzy0003qcbexjlr4ks7",
    "name": "Operations",
    "description": "Business logistics and physical facilities.",
    "isActive": true,
    "userCount": 0,
    "ticketCount": 0,
    "assetCount": 0,
    "createdAt": "2026-10-15T14:03:03.742Z",
    "updatedAt": "2026-11-03T06:34:25.132Z"
  },
  {
    "id": "cmv9lzg070004qcbexfll0i7j",
    "name": "Sales",
    "description": "Enterprise sales and customer accounts.",
    "isActive": true,
    "userCount": 1,
    "ticketCount": 2,
    "assetCount": 1,
    "createdAt": "2026-10-15T14:03:03.751Z",
    "updatedAt": "2026-11-03T06:34:25.135Z"
  }
];

export const HELPDESK_TECHNICIANS: HelpdeskTechnician[] = [
  {
    "id": "cmv9jxn0l0002lxim967jnlkr",
    "name": "Arjun Mehta",
    "email": "arjun.mehta@helpdesk.local"
  },
  {
    "id": "cmv9lzg3b000oqcbe3jr861v9",
    "name": "David Chen",
    "email": "david.chen@helpdesk.local"
  },
  {
    "id": "cmv9jxn100004lximwd7638uw",
    "name": "Neha Sharma",
    "email": "neha.sharma@helpdesk.local"
  },
  {
    "id": "cmv9jxn0s0003lximsu42wpxf",
    "name": "Rahul Menon",
    "email": "rahul.menon@helpdesk.local"
  }
];

export const HELPDESK_INITIAL_TICKETS: HelpdeskTicket[] = [
  {
    "id": "cmw0bboji004taagfrtl2afpj",
    "ticketNumber": "HD-1053",
    "title": "Persistent Server Test Ticket",
    "description": "Testing that database records survive application restart and reconnect.",
    "category": "SOFTWARE",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0l0002lxim967jnlkr",
    "departmentId": null,
    "slaDeadline": "2026-11-03T10:34:25.656Z",
    "firstResponseDeadline": "2026-11-03T07:04:25.656Z",
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T06:34:25.662Z",
    "updatedAt": "2026-11-03T06:34:25.681Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0l0002lxim967jnlkr",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@helpdesk.local"
    },
    "department": null,
    "comments": [
      {
        "id": "c-cmw0bboji004taagfrtl2afpj-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1053 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T06:34:25.662Z"
      },
      {
        "id": "c-cmw0bboji004taagfrtl2afpj-2",
        "author": {
          "name": "Arjun Mehta",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-03T06:34:25.681Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bboji004taagfrtl2afpj-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T06:34:25.662Z",
        "changerName": "Priya Nair"
      },
      {
        "id": "sh-cmw0bboji004taagfrtl2afpj-2",
        "previousStatus": "OPEN",
        "newStatus": "IN_PROGRESS",
        "changedAt": "2026-11-03T06:34:25.681Z",
        "changerName": "Arjun Mehta"
      }
    ]
  },
  {
    "id": "cmw0bbohx004caagfk8dia72r",
    "ticketNumber": "HD-1052",
    "title": "Docking station USB ports unresponsive",
    "description": "CalDigit TS4 dock charges laptop, but connected keyboard and webcam do not respond.",
    "category": "HARDWARE",
    "priority": "MEDIUM",
    "status": "OPEN",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T05:52:25.339Z",
    "updatedAt": "2026-11-03T05:52:25.339Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "comments": [
      {
        "id": "c-cmw0bbohx004caagfk8dia72r-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1052 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T05:52:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbohx004caagfk8dia72r-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T05:52:25.339Z",
        "changerName": "Priya Nair"
      }
    ]
  },
  {
    "id": "cmw0bbogv003waagfs2gndr0i",
    "ticketNumber": "HD-1050",
    "title": "Production database read replica latency spike",
    "description": "Reporting queries experiencing high replication lag on Postgres secondary node.",
    "category": "SOFTWARE",
    "priority": "URGENT",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": "cmv9jxn100004lximwd7638uw",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T05:34:25.339Z",
    "updatedAt": "2026-11-03T05:34:25.339Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn100004lximwd7638uw",
      "name": "Neha Sharma",
      "email": "neha.sharma@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "comments": [
      {
        "id": "c-cmw0bbogv003waagfs2gndr0i-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1050 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T05:34:25.339Z"
      },
      {
        "id": "c-cmw0bbogv003waagfs2gndr0i-2",
        "author": {
          "name": "Neha Sharma",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-03T05:34:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbogv003waagfs2gndr0i-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T05:34:25.339Z",
        "changerName": "Kavya Raman"
      },
      {
        "id": "sh-cmw0bbogv003waagfs2gndr0i-2",
        "previousStatus": "OPEN",
        "newStatus": "IN_PROGRESS",
        "changedAt": "2026-11-03T05:34:25.339Z",
        "changerName": "Neha Sharma"
      }
    ]
  },
  {
    "id": "cmw0bbogl003saagfurjj5yoq",
    "ticketNumber": "HD-1049",
    "title": "Microsoft Teams microphone not detected",
    "description": "Built-in microphone not recognized by Teams desktop client after privacy settings update.",
    "category": "SOFTWARE",
    "priority": "MEDIUM",
    "status": "OPEN",
    "reporterId": "cmv9lzg27000gqcbep6elqvrm",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzg070004qcbexfll0i7j",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T05:22:25.339Z",
    "updatedAt": "2026-11-03T05:22:25.339Z",
    "reporter": {
      "id": "cmv9lzg27000gqcbep6elqvrm",
      "name": "Rohan Verma",
      "email": "rohan.verma@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzg070004qcbexfll0i7j",
      "name": "Sales"
    },
    "comments": [
      {
        "id": "c-cmw0bbogl003saagfurjj5yoq-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1049 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T05:22:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbogl003saagfurjj5yoq-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T05:22:25.339Z",
        "changerName": "Rohan Verma"
      }
    ]
  },
  {
    "id": "cmw0bbobs001qaagfknmy4fcj",
    "ticketNumber": "HD-1043",
    "title": "Wi-Fi drops in meeting room 3",
    "description": "Conference room 3 wireless connection continuously drops during Zoom calls.",
    "category": "NETWORK",
    "priority": "HIGH",
    "status": "OPEN",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T04:46:25.339Z",
    "updatedAt": "2026-11-03T04:46:25.339Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "comments": [
      {
        "id": "c-cmw0bbobs001qaagfknmy4fcj-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1043 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T04:46:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbobs001qaagfknmy4fcj-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T04:46:25.339Z",
        "changerName": "Kavya Raman"
      }
    ]
  },
  {
    "id": "cmw0bboao001aaagfzbw6de0m",
    "ticketNumber": "HD-1042",
    "title": "Laptop does not boot after update",
    "description": "Following yesterday OS update, laptop displays blue screen with CRITICAL_PROCESS_DIED loop.",
    "category": "HARDWARE",
    "priority": "URGENT",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0l0002lxim967jnlkr",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T04:04:25.339Z",
    "updatedAt": "2026-11-03T04:04:25.339Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0l0002lxim967jnlkr",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "comments": [
      {
        "id": "c-cmw0bboao001aaagfzbw6de0m-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1042 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T04:04:25.339Z"
      },
      {
        "id": "c-cmw0bboao001aaagfzbw6de0m-2",
        "author": {
          "name": "Arjun Mehta",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-03T04:04:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bboao001aaagfzbw6de0m-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T04:04:25.339Z",
        "changerName": "Priya Nair"
      },
      {
        "id": "sh-cmw0bboao001aaagfzbw6de0m-2",
        "previousStatus": "OPEN",
        "newStatus": "IN_PROGRESS",
        "changedAt": "2026-11-03T04:04:25.339Z",
        "changerName": "Arjun Mehta"
      }
    ]
  },
  {
    "id": "cmw0bbohm0048aagf5paaitdr",
    "ticketNumber": "HD-1051",
    "title": "New hire GitHub Enterprise seat request",
    "description": "Provision repository access and assign Copilot license for incoming backend engineer.",
    "category": "ACCOUNT_ACCESS",
    "priority": "LOW",
    "status": "OPEN",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T03:04:25.339Z",
    "updatedAt": "2026-11-03T03:04:25.339Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "comments": [
      {
        "id": "c-cmw0bbohm0048aagf5paaitdr-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1051 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T03:04:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbohm0048aagf5paaitdr-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T03:04:25.339Z",
        "changerName": "Priya Nair"
      }
    ]
  },
  {
    "id": "cmw0bboeg002waagf2y3fdbd8",
    "ticketNumber": "HD-1046",
    "title": "Monitor flickers intermittently",
    "description": "External Dell 27-inch display flashes black every 5 to 10 minutes when connected via HDMI.",
    "category": "HARDWARE",
    "priority": "LOW",
    "status": "OPEN",
    "reporterId": "cmv9lzg27000gqcbep6elqvrm",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzg070004qcbexfll0i7j",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T01:34:25.339Z",
    "updatedAt": "2026-11-03T01:34:25.339Z",
    "reporter": {
      "id": "cmv9lzg27000gqcbep6elqvrm",
      "name": "Rohan Verma",
      "email": "rohan.verma@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzg070004qcbexfll0i7j",
      "name": "Sales"
    },
    "comments": [
      {
        "id": "c-cmw0bboeg002waagf2y3fdbd8-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1046 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T01:34:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bboeg002waagf2y3fdbd8-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T01:34:25.339Z",
        "changerName": "Rohan Verma"
      }
    ]
  },
  {
    "id": "cmw0bboer0030aagf436gpica",
    "ticketNumber": "HD-1047",
    "title": "Unable to access shared network drive",
    "description": "Network mapping for Z: Finance Share returns System Error 67 (Network name cannot be found).",
    "category": "NETWORK",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": "cmv9jxn0s0003lximsu42wpxf",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-03T00:34:25.339Z",
    "updatedAt": "2026-11-03T00:34:25.339Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0s0003lximsu42wpxf",
      "name": "Rahul Menon",
      "email": "rahul.menon@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "comments": [
      {
        "id": "c-cmw0bboer0030aagf436gpica-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1047 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-03T00:34:25.339Z"
      },
      {
        "id": "c-cmw0bboer0030aagf436gpica-2",
        "author": {
          "name": "Rahul Menon",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-03T00:34:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bboer0030aagf436gpica-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-03T00:34:25.339Z",
        "changerName": "Kavya Raman"
      },
      {
        "id": "sh-cmw0bboer0030aagf436gpica-2",
        "previousStatus": "OPEN",
        "newStatus": "IN_PROGRESS",
        "changedAt": "2026-11-03T00:34:25.339Z",
        "changerName": "Rahul Menon"
      }
    ]
  },
  {
    "id": "cmw0bbofj003caagf2xesab3i",
    "ticketNumber": "HD-1048",
    "title": "Printer unavailable on office network",
    "description": "Floor 3 HP LaserJet does not accept print jobs from Mac workstations.",
    "category": "HARDWARE",
    "priority": "MEDIUM",
    "status": "RESOLVED",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0l0002lxim967jnlkr",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-02T15:34:25.339Z",
    "updatedAt": "2026-11-02T15:34:25.339Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0l0002lxim967jnlkr",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "comments": [
      {
        "id": "c-cmw0bbofj003caagf2xesab3i-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1048 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-02T15:34:25.339Z"
      },
      {
        "id": "c-cmw0bbofj003caagf2xesab3i-2",
        "author": {
          "name": "Arjun Mehta",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-02T15:34:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbofj003caagf2xesab3i-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-02T15:34:25.339Z",
        "changerName": "Priya Nair"
      },
      {
        "id": "sh-cmw0bbofj003caagf2xesab3i-2",
        "previousStatus": "OPEN",
        "newStatus": "RESOLVED",
        "changedAt": "2026-11-02T15:34:25.339Z",
        "changerName": "Arjun Mehta"
      }
    ]
  },
  {
    "id": "cmw0bboc2001uaagfgmc6hfhe",
    "ticketNumber": "HD-1044",
    "title": "VPN licence expired",
    "description": "Cannot connect to Cisco AnyConnect VPN gateway. Client error: Subscription seat expired.",
    "category": "NETWORK",
    "priority": "MEDIUM",
    "status": "RESOLVED",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0s0003lximsu42wpxf",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-02T04:34:25.339Z",
    "updatedAt": "2026-11-02T04:34:25.339Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0s0003lximsu42wpxf",
      "name": "Rahul Menon",
      "email": "rahul.menon@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "comments": [
      {
        "id": "c-cmw0bboc2001uaagfgmc6hfhe-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1044 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-02T04:34:25.339Z"
      },
      {
        "id": "c-cmw0bboc2001uaagfgmc6hfhe-2",
        "author": {
          "name": "Rahul Menon",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-02T04:34:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bboc2001uaagfgmc6hfhe-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-02T04:34:25.339Z",
        "changerName": "Priya Nair"
      },
      {
        "id": "sh-cmw0bboc2001uaagfgmc6hfhe-2",
        "previousStatus": "OPEN",
        "newStatus": "RESOLVED",
        "changedAt": "2026-11-02T04:34:25.339Z",
        "changerName": "Rahul Menon"
      }
    ]
  },
  {
    "id": "cmw0bbod4002caagfb235dxhy",
    "ticketNumber": "HD-1045",
    "title": "Account locked after password reset",
    "description": "Locked out of Workday and Outlook following 90-day password change.",
    "category": "ACCOUNT_ACCESS",
    "priority": "LOW",
    "status": "CLOSED",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": "cmv9jxn100004lximwd7638uw",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": null,
    "firstResponseDeadline": null,
    "firstResponseAt": null,
    "resolvedAt": null,
    "isEscalated": false,
    "createdAt": "2026-11-01T04:34:25.339Z",
    "updatedAt": "2026-11-01T04:34:25.339Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn100004lximwd7638uw",
      "name": "Neha Sharma",
      "email": "neha.sharma@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "comments": [
      {
        "id": "c-cmw0bbod4002caagfb235dxhy-1",
        "author": {
          "name": "IT Helpdesk System",
          "role": "SYSTEM"
        },
        "content": "Ticket HD-1045 auto-triaged and assigned SLA window.",
        "isInternal": true,
        "createdAt": "2026-11-01T04:34:25.339Z"
      },
      {
        "id": "c-cmw0bbod4002caagfb235dxhy-2",
        "author": {
          "name": "Neha Sharma",
          "role": "TECHNICIAN"
        },
        "content": "Acknowledged. Currently investigating telemetry and system diagnostic logs.",
        "isInternal": false,
        "createdAt": "2026-11-01T04:34:25.339Z"
      }
    ],
    "statusHistory": [
      {
        "id": "sh-cmw0bbod4002caagfb235dxhy-1",
        "previousStatus": "NEW",
        "newStatus": "OPEN",
        "changedAt": "2026-11-01T04:34:25.339Z",
        "changerName": "Kavya Raman"
      },
      {
        "id": "sh-cmw0bbod4002caagfb235dxhy-2",
        "previousStatus": "OPEN",
        "newStatus": "CLOSED",
        "changedAt": "2026-11-01T04:34:25.339Z",
        "changerName": "Neha Sharma"
      }
    ]
  }
];

const STORAGE_KEY = 'dharya_helpdesk_tickets_v1';

export function getStoredHelpdeskTickets(): HelpdeskTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return HELPDESK_INITIAL_TICKETS;
}

export function saveStoredHelpdeskTickets(tickets: HelpdeskTicket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}
