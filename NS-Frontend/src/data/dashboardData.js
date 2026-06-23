export const dashboardSummary = [
  { label: 'Assigned Projects', value: '08', status: '+2 new this month', icon: 'Briefcase' },
  { label: 'Tasks Due This Week', value: '14', status: '6 high priority', icon: 'ListChecks' },
  { label: 'Unread Team Messages', value: '26', status: '4 mentions', icon: 'MessagesSquare' },
  { label: 'Upcoming Meetings', value: '03', status: 'Next in 30 min', icon: 'CalendarDays' },
]

export const dashboardProjects = [
  {
    id: 'ai-automation-platform',
    name: 'AI Automation Platform',
    client: 'Northstar Bank',
    type: 'AI Automation',
    status: 'In Progress',
    priority: 'High',
    deadline: 'Jul 18, 2026',
    progress: 72,
    developers: ['Rohit', 'Priya', 'Aman'],
    requirements:
      'Automate intake review, classify workflow risk, create approval routing, and provide executive audit visibility.',
    tasks: ['Authentication setup', 'Workflow classifier', 'Client dashboard', 'Audit log exports'],
    files: ['requirements-v2.pdf', 'bank-api-map.xlsx', 'automation-flow.fig'],
    messages: ['Please confirm the exception handling rules.', 'Risk team added new approval states.'],
  },
  {
    id: 'ecommerce-web-platform',
    name: 'E-commerce Web Platform',
    client: 'UrbanCart',
    type: 'Web Platform',
    status: 'Planning',
    priority: 'Medium',
    deadline: 'Aug 02, 2026',
    progress: 28,
    developers: ['Priya', 'Neha'],
    requirements:
      'Build a scalable storefront, admin product workflows, checkout integration, inventory sync, and analytics views.',
    tasks: ['Wireframe review', 'Catalog schema', 'Checkout planning', 'Analytics events'],
    files: ['brand-assets.zip', 'product-feed.csv'],
    messages: ['The client approved the product grid direction.', 'Inventory sync requirements are pending.'],
  },
  {
    id: 'cloud-infrastructure-setup',
    name: 'Cloud Infrastructure Setup',
    client: 'Aster Cloud',
    type: 'Cloud & DevOps',
    status: 'In Review',
    priority: 'High',
    deadline: 'Jul 05, 2026',
    progress: 86,
    developers: ['Aman', 'Rohit'],
    requirements:
      'Provision secure cloud environments, CI/CD pipelines, observability, backup policy, and release automation.',
    tasks: ['Network review', 'Pipeline hardening', 'Observability dashboard', 'Disaster recovery notes'],
    files: ['infra-plan.md', 'deployment-checklist.xlsx'],
    messages: ['Security review is almost complete.', 'Client asked for backup retention confirmation.'],
  },
  {
    id: 'mobile-health-app',
    name: 'Mobile Health App',
    client: 'Vale Health',
    type: 'Mobile Application',
    status: 'In Progress',
    priority: 'Medium',
    deadline: 'Aug 20, 2026',
    progress: 54,
    developers: ['Neha', 'Priya', 'Aman'],
    requirements:
      'Create patient intake, appointment routing, secure records preview, push notifications, and operational reporting.',
    tasks: ['Patient onboarding', 'Appointment routes', 'Security checklist', 'Push notification flow'],
    files: ['mobile-scope.pdf', 'ux-review.fig'],
    messages: ['Client wants the intake form shortened.', 'Routing dashboard demo is scheduled.'],
  },
]

export const recentActivities = [
  'Client uploaded new requirements for “AI Automation Platform”',
  'Team member updated API integration task',
  'New client message received for “E-commerce Portal”',
  'Meeting scheduled for “Cloud Migration Project”',
]

export const dashboardMeetings = [
  {
    id: 'm1',
    title: 'Client Requirement Meeting',
    project: 'AI Automation Platform',
    date: 'Jun 24, 2026',
    time: '10:30 AM',
    participants: ['Rohit', 'Priya', 'Northstar Team'],
    type: 'Client Requirement Meeting',
    status: 'upcoming',
  },
  {
    id: 'm2',
    title: 'Sprint Planning',
    project: 'E-commerce Web Platform',
    date: 'Jun 25, 2026',
    time: '02:00 PM',
    participants: ['Priya', 'Neha', 'UrbanCart'],
    type: 'Sprint Planning',
    status: 'upcoming',
  },
  {
    id: 'm3',
    title: 'Technical Discussion',
    project: 'Cloud Infrastructure Setup',
    date: 'Jun 26, 2026',
    time: '04:15 PM',
    participants: ['Aman', 'Rohit', 'Aster Cloud'],
    type: 'Technical Discussion',
    status: 'upcoming',
  },
  {
    id: 'm4',
    title: 'Project Review',
    project: 'Mobile Health App',
    date: 'Jun 20, 2026',
    time: '11:00 AM',
    participants: ['Neha', 'Vale Health'],
    type: 'Project Review',
    status: 'past',
  },
]

export const teamChannels = [
  { name: 'General', unread: 5 },
  { name: 'Development', unread: 8 },
  { name: 'UI/UX', unread: 2 },
  { name: 'Backend', unread: 4 },
  { name: 'AI Engineering', unread: 6 },
  { name: 'Cybersecurity', unread: 1 },
  { name: 'Project Updates', unread: 0 },
]

export const developers = ['Rohit', 'Priya', 'Aman', 'Neha', 'Karan']

export const teamMessages = [
  { sender: 'Rohit', time: '09:20 AM', text: 'I have completed the API authentication setup.' },
  { sender: 'Priya', time: '09:34 AM', text: 'I pushed the dashboard UI updates.' },
  { sender: 'Aman', time: '09:48 AM', text: 'Please review the MongoDB schema before today’s meeting.' },
]

export const clientConversations = [
  {
    id: 'northstar',
    client: 'Northstar Bank',
    project: 'AI Automation Platform',
    latest: 'Can we add exception approval rules?',
    time: '10:12 AM',
    unread: 3,
    status: 'Active',
    messages: [
      { sender: 'Northstar Bank', time: '09:30 AM', text: 'We uploaded the updated requirement document.' },
      { sender: 'Developer', time: '09:50 AM', text: 'Received. We will convert the new rules into tasks today.' },
      { sender: 'Northstar Bank', time: '10:12 AM', text: 'Can we add exception approval rules?' },
    ],
  },
  {
    id: 'urbancart',
    client: 'UrbanCart',
    project: 'E-commerce Web Platform',
    latest: 'Product import sample is ready.',
    time: 'Yesterday',
    unread: 1,
    status: 'Waiting for Client',
    messages: [
      { sender: 'UrbanCart', time: 'Yesterday', text: 'Product import sample is ready.' },
      { sender: 'Developer', time: 'Yesterday', text: 'Great, we will validate it against the catalog schema.' },
    ],
  },
  {
    id: 'aster',
    client: 'Aster Cloud',
    project: 'Cloud Infrastructure Setup',
    latest: 'Security review comments are resolved.',
    time: 'Mon',
    unread: 0,
    status: 'Resolved',
    messages: [
      { sender: 'Aster Cloud', time: 'Mon', text: 'Security review comments are resolved.' },
      { sender: 'Developer', time: 'Mon', text: 'Thanks. We moved the deployment checklist to review.' },
    ],
  },
  {
    id: 'vale',
    client: 'Vale Health',
    project: 'Mobile Health App',
    latest: 'Please prioritize patient routing screens.',
    time: 'Fri',
    unread: 2,
    status: 'Active',
    messages: [
      { sender: 'Vale Health', time: 'Fri', text: 'Please prioritize patient routing screens.' },
      { sender: 'Developer', time: 'Fri', text: 'We will move those into the next sprint plan.' },
    ],
  },
]

export const dashboardNotifications = [
  'New client message from Northstar Bank',
  'Meeting starts in 30 minutes',
  'Project deadline is approaching',
  'New project assigned',
  'Team member mentioned you in chat',
]

export const aiQuickActions = [
  'Analyze Client Requirements',
  'Generate Project Plan',
  'Break Project Into Tasks',
  'Suggest Tech Stack',
  'Review Code Architecture',
  'Create Sprint Plan',
  'Summarize Client Chat',
  'Generate Meeting Notes',
]

export const developerProfile = {
  name: 'Varlexa Developer',
  role: 'Full Stack AI Engineer',
  email: 'developer@varlexa.ai',
  skills: ['React', 'Node.js', 'AI Systems', 'Cloud', 'Cybersecurity', 'DevOps'],
  availability: 'Available for sprint work',
  projects: ['AI Automation Platform', 'Cloud Infrastructure Setup', 'Mobile Health App'],
}
