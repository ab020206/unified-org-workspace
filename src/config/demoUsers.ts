export interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleTitle: string;
  roleBadge: string;
  organizationName: string;
  description: string;
  iconName: string;
  avatar?: string;
  organizationSlug?: string;
  password?: string;
  memberships?: string[];
}

export type DemoUserConfig = DemoUser;

export const DEMO_PASSWORD = 'Demo@12345';

export const DEMO_USERS: DemoUserConfig[] = [
  {
    id: 'superadmin',
    firstName: 'Platform',
    lastName: 'SuperAdmin',
    email: 'superadmin@platform.demo',
    role: 'SUPER_ADMIN',
    roleTitle: 'Platform Super Admin',
    roleBadge: 'SUPER_ADMIN',
    organizationName: 'Platform View (All Orgs)',
    description: 'Platform Super Admin access with cross-organization switching to Acme, Nova, Zenith & Platform View.',
    iconName: 'ShieldCheck',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Platform View', 'Acme Technologies', 'Nova Healthcare', 'Zenith Logistics'],
  },

  // Multi-Membership Users
  {
    id: 'john-multi',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@demo.com',
    role: 'ADMIN',
    roleTitle: 'Multi-Org Executive (John)',
    roleBadge: 'MULTI_MEMBERSHIP',
    organizationName: 'Acme & Zenith',
    description: 'Admin at Acme Technologies + Reviewer at Zenith Logistics. Test org switching between Acme & Zenith.',
    iconName: 'UserCheck',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Acme Technologies (Admin)', 'Zenith Logistics (Reviewer)'],
  },
  {
    id: 'sarah-multi',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah@demo.com',
    role: 'SUPPORT_AGENT',
    roleTitle: 'Multi-Org Support Lead (Sarah)',
    roleBadge: 'MULTI_MEMBERSHIP',
    organizationName: 'Acme & Nova',
    description: 'Support Agent at Acme Technologies + Support Agent at Nova Healthcare.',
    iconName: 'Headphones',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Acme Technologies (Support)', 'Nova Healthcare (Support)'],
  },
  {
    id: 'michael-multi',
    firstName: 'Michael',
    lastName: 'Scott',
    email: 'michael@demo.com',
    role: 'REVIEWER',
    roleTitle: 'Multi-Org Reviewer (Michael)',
    roleBadge: 'MULTI_MEMBERSHIP',
    organizationName: 'Nova & Zenith',
    description: 'Reviewer at Nova Healthcare + Guest at Zenith Logistics.',
    iconName: 'GitPullRequest',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Nova Healthcare (Reviewer)', 'Zenith Logistics (Guest)'],
  },

  // Organization Admins
  {
    id: 'admin-acme',
    firstName: 'Ananya',
    lastName: 'Patel',
    email: 'admin@acme.demo',
    role: 'ADMIN',
    roleTitle: 'Acme Admin',
    roleBadge: 'ADMIN',
    organizationName: 'Acme Technologies',
    description: 'Organization Administrator for Acme Technologies.',
    iconName: 'Building2',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Acme Technologies (Admin)'],
  },
  {
    id: 'admin-nova',
    firstName: 'Vikram',
    lastName: 'Mehta',
    email: 'admin@nova.demo',
    role: 'ADMIN',
    roleTitle: 'Nova Admin',
    roleBadge: 'ADMIN',
    organizationName: 'Nova Healthcare',
    description: 'Organization Administrator for Nova Healthcare.',
    iconName: 'Building2',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Nova Healthcare (Admin)'],
  },
  {
    id: 'admin-zenith',
    firstName: 'Rajesh',
    lastName: 'Verma',
    email: 'admin@zenith.demo',
    role: 'ADMIN',
    roleTitle: 'Zenith Admin',
    roleBadge: 'ADMIN',
    organizationName: 'Zenith Logistics',
    description: 'Organization Administrator for Zenith Logistics.',
    iconName: 'Building2',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Zenith Logistics (Admin)'],
  },

  // Support Agents
  {
    id: 'support1-acme',
    firstName: 'Sunita',
    lastName: 'Rao',
    email: 'support1@acme.demo',
    role: 'SUPPORT_AGENT',
    roleTitle: 'Acme Support Lead',
    roleBadge: 'SUPPORT',
    organizationName: 'Acme Technologies',
    description: 'Primary customer support agent for Acme Technologies.',
    iconName: 'Headphones',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Acme Technologies (Support)'],
  },
  {
    id: 'support-nova',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'support@nova.demo',
    role: 'SUPPORT_AGENT',
    roleTitle: 'Nova Support Specialist',
    roleBadge: 'SUPPORT',
    organizationName: 'Nova Healthcare',
    description: 'Support specialist handling Nova Healthcare tickets.',
    iconName: 'Headphones',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Nova Healthcare (Support)'],
  },

  // Reviewers
  {
    id: 'reviewer-acme',
    firstName: 'Rohan',
    lastName: 'Gupta',
    email: 'reviewer@acme.demo',
    role: 'REVIEWER',
    roleTitle: 'Acme Code Reviewer',
    roleBadge: 'REVIEWER',
    organizationName: 'Acme Technologies',
    description: 'Code reviewer and pull request decision maker for Acme.',
    iconName: 'GitPullRequest',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Acme Technologies (Reviewer)'],
  },

  // Guests & Auditors
  {
    id: 'guest-nova',
    firstName: 'Varun',
    lastName: 'Nair',
    email: 'guest@nova.demo',
    role: 'GUEST',
    roleTitle: 'Nova Guest Viewer',
    roleBadge: 'GUEST',
    organizationName: 'Nova Healthcare',
    description: 'Guest account for viewing shared resources in Nova Healthcare.',
    iconName: 'Eye',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Nova Healthcare (Guest)'],
  },
  {
    id: 'auditor-acme',
    firstName: 'Aditya',
    lastName: 'Nair',
    email: 'auditor@acme.demo',
    role: 'AUDITOR',
    roleTitle: 'Acme Auditor',
    roleBadge: 'AUDITOR',
    organizationName: 'Acme Technologies',
    description: 'Auditor inspecting audit logs and security compliance.',
    iconName: 'ShieldCheck',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    password: DEMO_PASSWORD,
    memberships: ['Acme Technologies (Auditor)'],
  },
];
