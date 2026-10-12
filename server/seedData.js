// Seed data for AIT Pune Campus Hub
// Strictly includes all 29 Club Communication Channels, FE Announcements, 5 Departments, and Hostels

export const CLUB_CHANNELS = [
  'AR-VR',
  'Astronomy Club',
  'Centre of Excellence for AI & Robotics',
  'Code Programming Club',
  'College Innovation Development Club (CIDC)',
  'Cultural & Musical Board',
  'Cycling Club',
  'Debate, Quiz & Dramatics Clubs',
  'Drone Club',
  'EV Cell',
  'Film Club',
  'Fine Arts Club',
  'Google Development Student Club (GDSC)',
  'I & E Cell',
  'Information Security & Digital Forensic Club',
  'Magazine Board',
  'Music and Dance Club',
  'Nature Club',
  'NSS Club',
  'OSS Club',
  'Press News Cell',
  'Public Relation (PR)',
  'R&D Cell',
  'Radio Club',
  'SAE – AIT Collegiate Club',
  'Social Media Cell',
  'Spiritual Club',
  'Sports Club',
  'Technical & Maths Board',
];

export const DEPARTMENTS = [
  { name: 'Information Technology (IT)', slug: 'dept-it', code: 'IT' },
  { name: 'Computer Engineering (COMP)', slug: 'dept-comp', code: 'COMP' },
  { name: 'Electronics and Telecommunication (ENTC)', slug: 'dept-entc', code: 'ENTC' },
  { name: 'Mechanical Engineering (MECH)', slug: 'dept-mech', code: 'MECH' },
  { name: 'Automation and Robotics Engineering (ARE)', slug: 'dept-are', code: 'ARE' },
];

export const INITIAL_USERS = [
  {
    id: 'user_stu_ananya',
    displayName: 'Ananya Sharma',
    role: 'student',
    branch: 'Information Technology',
    academicYear: 'Third Year',
    hostelAssignment: "Girls' Hostel",
    verified: true,
    regNumber: '241108', // Private - must never be exposed publicly
    email: 'ananya.s@aitpune.edu.in', // Private
    phone: '+91 9823012345', // Private
    admissionBatch: '2023-2027',
  },
  {
    id: 'user_stu_rohan',
    displayName: 'Rohan Verma',
    role: 'student',
    branch: 'Computer Engineering',
    academicYear: 'Fourth Year',
    hostelAssignment: "Boys' Hostel",
    verified: true,
    regNumber: '231045', // Private
    email: 'rohan.v@aitpune.edu.in', // Private
    phone: '+91 9823054321', // Private
    admissionBatch: '2022-2026',
  },
  {
    id: 'user_stu_fe',
    displayName: 'Divya Nair',
    role: 'student',
    branch: 'First Year Engineering (Common)',
    academicYear: 'First Year',
    hostelAssignment: "Girls' Hostel",
    verified: true,
    regNumber: '261012', // Private (Batch 2026 convention)
    email: 'divya.n@aitpune.edu.in', // Private
    phone: '+91 9823098765', // Private
    admissionBatch: '2025-2029',
  },
  {
    id: 'user_club_lead_aarav',
    displayName: 'Aarav Kulkarni',
    role: 'club_lead',
    managedClub: 'Google Development Student Club (GDSC)',
    branch: 'Computer Engineering',
    academicYear: 'Fourth Year',
    hostelAssignment: "Boys' Hostel",
    verified: true,
    regNumber: '231011',
    email: 'aarav.k@aitpune.edu.in',
    phone: '+91 9823011111',
    admissionBatch: '2022-2026',
  },
  {
    id: 'user_faculty_deshmukh',
    displayName: 'Prof. K. S. Deshmukh',
    role: 'faculty',
    department: 'Computer Engineering (COMP)',
    designation: 'Head of Department & Innovation Mentor',
    hostelAssignment: 'None',
    verified: true,
    email: 'ksdeshmukh@aitpune.edu.in',
    phone: '+91 9823022222',
  },
  {
    id: 'user_warden_patil',
    displayName: 'Dr. Sunita Patil',
    role: 'warden',
    assignedHostel: "Girls' Hostel",
    hostelAssignment: "Girls' Hostel",
    designation: "Chief Warden - Girls' Hostel",
    verified: true,
    email: 'warden.girls@aitpune.edu.in',
    phone: '+91 9823033333',
  },
  {
    id: 'user_warden_singh',
    displayName: 'Col. R. K. Singh',
    role: 'warden',
    assignedHostel: "Boys' Hostel",
    hostelAssignment: "Boys' Hostel",
    designation: "Chief Warden - Boys' Hostel",
    verified: true,
    email: 'warden.boys@aitpune.edu.in',
    phone: '+91 9823044444',
  },
  {
    id: 'user_alumni_priya',
    displayName: 'Priya Rathore',
    role: 'alumni',
    graduationYear: 2022,
    company: 'Microsoft India',
    designation: 'Software Engineer II',
    verified: true, // Verified by admin
    hostelAssignment: 'None',
    email: 'priya.rathore@alumni.aitpune.edu.in',
    phone: '+91 9823055555',
  },
  {
    id: 'user_alumni_vikram',
    displayName: 'Vikram Choudhary',
    role: 'alumni',
    graduationYear: 2024,
    company: 'AeroDrone Technologies',
    designation: 'Co-founder',
    verified: false, // Pending admin approval
    hostelAssignment: 'None',
    email: 'vikram.c@alumni.aitpune.edu.in',
    phone: '+91 9823066666',
  },
  {
    id: 'user_admin',
    displayName: 'Dr. V. P. Patil (Admin)',
    role: 'admin',
    designation: 'Campus Platform Administrator & Faculty Incharge',
    hostelAssignment: 'None',
    verified: true,
    email: 'admin.campushub@aitpune.edu.in',
    phone: '+91 9823077777',
  },
];

export function getInitialCommunities() {
  const communities = [];

  // 1. FE Announcements
  communities.push({
    id: 'comm_fe',
    name: 'FE Announcements',
    slug: 'fe-announcements',
    category: 'fe',
    description: 'Official academic notices, timetable circulars, and university guidelines for First Year Engineering students.',
    isRestricted: false,
    allowedRoles: ['all'],
    isOfficialSource: true,
    isDemo: true,
  });

  // 2. 5 Departments
  DEPARTMENTS.forEach((dept) => {
    communities.push({
      id: `comm_${dept.slug}`,
      name: dept.name,
      slug: dept.slug,
      category: 'department',
      departmentCode: dept.code,
      description: `Academic hub, laboratory schedules, project submissions, and seminar notices for ${dept.name}.`,
      isRestricted: false,
      allowedRoles: ['all'],
      isOfficialSource: true,
      isDemo: true,
    });
  });

  // 3. Exactly 29 Club Channels
  CLUB_CHANNELS.forEach((clubName, index) => {
    const slug = 'club-' + clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    communities.push({
      id: `comm_club_${index + 1}`,
      name: clubName,
      slug: slug,
      category: 'club',
      description: `Official campus communication channel for ${clubName}. Open to all students for updates, workshops, and recruitment news.`,
      isRestricted: false,
      allowedRoles: ['all'],
      isOfficialSource: false,
      isDemo: true,
    });
  });

  // 4. Hostels (Strictly Restricted!)
  communities.push({
    id: 'comm_hostel_girls',
    name: "Girls' Hostel",
    slug: 'hostel-girls',
    category: 'hostel',
    hostelAssignment: "Girls' Hostel",
    description: "Restricted community for Girls' Hostel residents and authorized wardens. Maintenance, curfew notices, mess menus, and hostel announcements.",
    isRestricted: true,
    allowedHostel: "Girls' Hostel",
    isOfficialSource: true,
    isDemo: true,
  });

  communities.push({
    id: 'comm_hostel_boys',
    name: "Boys' Hostel",
    slug: 'hostel-boys',
    category: 'hostel',
    hostelAssignment: "Boys' Hostel",
    description: "Restricted community for Boys' Hostel residents and authorized wardens. Maintenance, curfew notices, mess menus, and hostel announcements.",
    isRestricted: true,
    allowedHostel: "Boys' Hostel",
    isOfficialSource: true,
    isDemo: true,
  });

  return communities;
}

export function getInitialMessages() {
  return [
    {
      id: 'msg_fe_01',
      communitySlug: 'fe-announcements',
      authorId: 'user_admin',
      authorDisplayName: 'Dr. V. P. Patil (Admin)',
      roleBadge: 'Admin / Faculty Incharge',
      title: '[DEMO] End-Semester Practical Examination Schedule 2026',
      content: 'All FE students are informed that the SPPU Phase-II Practical Examination schedule has been released on the college portal. Please verify your batch slots and report with completed laboratory journals.',
      type: 'notice',
      isOfficial: true,
      isPinned: true,
      createdAt: '2026-10-10T09:30:00Z',
      isDemo: true,
    },
    {
      id: 'msg_comp_01',
      communitySlug: 'dept-comp',
      authorId: 'user_faculty_deshmukh',
      authorDisplayName: 'Prof. K. S. Deshmukh',
      roleBadge: 'HOD Computer Engineering',
      title: '[DEMO] Final Year Major Project Review-II Announcement',
      content: 'BE Computer Engineering project teams must submit their mid-term progress reports by Friday 17:00 IST. The evaluation committee will assess GitHub commit history, architecture diagrams, and hardware integration status.',
      type: 'notice',
      isOfficial: true,
      isPinned: true,
      createdAt: '2026-10-09T14:15:00Z',
      isDemo: true,
    },
    {
      id: 'msg_gdsc_01',
      communitySlug: 'club-google-development-student-club-gdsc',
      authorId: 'user_club_lead_aarav',
      authorDisplayName: 'Aarav Kulkarni',
      roleBadge: 'GDSC Lead',
      title: '[DEMO] Google Cloud Study Jam 2026 & AI Workshop',
      content: 'We are kicking off the Annual GDSC Cloud Study Jam! Hands-on labs covering Vertex AI, Cloud Run, and Gemini API integration. Registered participants will receive complimentary skill badges and credits.',
      type: 'announcement',
      isOfficial: true,
      isPinned: true,
      createdAt: '2026-10-11T10:00:00Z',
      isDemo: true,
    },
    {
      id: 'msg_hg_01',
      communitySlug: 'hostel-girls',
      authorId: 'user_warden_patil',
      authorDisplayName: 'Dr. Sunita Patil',
      roleBadge: "Girls' Hostel Warden",
      title: '[DEMO] [RESTRICTED] Solar Water Heater Maintenance & Inspection',
      content: 'Maintenance of the A-Wing and B-Wing solar heating system will be conducted tomorrow between 10:00 AM and 01:00 PM. Hot water supply will resume normal operation by 2:00 PM.',
      type: 'notice',
      isOfficial: true,
      isPinned: true,
      createdAt: '2026-10-11T08:00:00Z',
      isDemo: true,
    },
    {
      id: 'msg_hb_01',
      communitySlug: 'hostel-boys',
      authorId: 'user_warden_singh',
      authorDisplayName: 'Col. R. K. Singh',
      roleBadge: "Boys' Hostel Warden",
      title: '[DEMO] [RESTRICTED] Mess Committee Review Meeting and Wi-Fi Upgrade',
      content: 'The monthly hostel mess review will convene this Thursday at 19:30 hrs in the Ramanujam Hall. Wing representatives must submit student feedback on dietary requirements.',
      type: 'notice',
      isOfficial: true,
      isPinned: true,
      createdAt: '2026-10-11T08:30:00Z',
      isDemo: true,
    },
    {
      id: 'msg_robotics_01',
      communitySlug: 'club-centre-of-excellence-for-ai-robotics',
      authorId: 'user_stu_ananya',
      authorDisplayName: 'Ananya Sharma',
      roleBadge: 'Student Member',
      title: '[DEMO] Autonomous Quadruped Robot Hardware Testing',
      content: 'The robotics lab is testing the ROS2 Humble navigational stack on our quadruped platform today. Anyone interested in sensor fusion with LiDAR is welcome to observe at Lab 304.',
      type: 'discussion',
      isOfficial: false,
      isPinned: false,
      createdAt: '2026-10-11T12:00:00Z',
      isDemo: true,
    },
    {
      id: 'msg_it_01',
      communitySlug: 'dept-it',
      authorId: 'user_admin',
      authorDisplayName: 'Dr. V. P. Patil (Admin)',
      roleBadge: 'Administrator',
      title: '[DEMO] High Performance Computing (HPC) Cluster Access for Research',
      content: 'IT Department research students working on Deep Learning or Computer Vision projects can now request SSH credentials for the newly installed NVIDIA cluster.',
      type: 'notice',
      isOfficial: true,
      isPinned: false,
      createdAt: '2026-10-08T11:00:00Z',
      isDemo: true,
    },
  ];
}

export function getInitialIdeas() {
  return [
    {
      id: 'idea_01',
      title: '[DEMO] Edge-AI Autonomous Border Surveillance Drone',
      description: 'Developing a localized low-latency drone swarm tracking system using Jetson Orin Nano with thermal and infrared cameras for night perimeter security at rugged terrains.',
      category: 'Defense Tech',
      tags: ['Defense', 'Embedded Systems', 'Computer Vision', 'ROS2'],
      authorId: 'user_stu_rohan',
      authorDisplayName: 'Rohan Verma',
      seekingTeammates: true,
      neededSkills: ['Embedded C++', 'PyTorch Model Optimization', 'PCB Design'],
      status: 'In Development',
      likesCount: 18,
      createdAt: '2026-10-05T10:00:00Z',
      isDemo: true,
    },
    {
      id: 'idea_02',
      title: '[DEMO] Smart Campus Microgrid & Solar Energy Forecasting',
      description: 'Using transformer models to forecast AIT Pune academic block solar power generation and automatically balance hostel backup battery distribution in real time.',
      category: 'CleanTech',
      tags: ['IoT', 'Energy', 'Time Series ML', 'ESP32'],
      authorId: 'user_stu_ananya',
      authorDisplayName: 'Ananya Sharma',
      seekingTeammates: true,
      neededSkills: ['Microcontroller Firmware', 'React Dashboard', 'FastAPI'],
      status: 'Active',
      likesCount: 24,
      createdAt: '2026-10-07T14:30:00Z',
      isDemo: true,
    },
    {
      id: 'idea_03',
      title: '[DEMO] MediAssist: Offline Clinical Decision Support for Rural Camps',
      description: 'Quantized LLM running locally on Android tablets to help medical corps personnel triage symptoms, recommend initial treatment protocols, and catalog inventory during field drills.',
      category: 'Healthcare & AI',
      tags: ['Offline AI', 'Android', 'LLM Quantization', 'Healthcare'],
      authorId: 'user_stu_fe',
      authorDisplayName: 'Divya Nair',
      seekingTeammates: false,
      neededSkills: [],
      status: 'Active',
      likesCount: 12,
      createdAt: '2026-10-08T16:00:00Z',
      isDemo: true,
    },
  ];
}

export function getInitialProjects() {
  return [
    {
      id: 'proj_01',
      title: '[DEMO] Project Garuda: Autonomous Fixed-Wing Aerial Vehicle',
      description: 'Designed and fabricated by AIT students for UAV reconnaissance competitions. Features fail-safe return-to-home, 45-minute endurance, and custom carbon-composite airframe.',
      category: 'Aerospace & Robotics',
      leadDisplayName: 'Rohan Verma & SAE Team',
      liveUrl: 'https://github.com/ait-garuda-demo',
      repoUrl: 'https://github.com/ait-garuda-demo',
      status: 'Completed',
      milestones: [
        { title: 'Airframe Aerodynamic Simulation', completed: true, date: '2026-03-15' },
        { title: 'Autopilot Hardware-in-the-Loop Testing', completed: true, date: '2026-06-20' },
        { title: 'Field Endurance Flight at Range', completed: true, date: '2026-09-10' },
      ],
      isDemo: true,
    },
    {
      id: 'proj_02',
      title: '[DEMO] AIT Campus Indoor Navigation & Asset Locator',
      description: 'Ultra-wideband (UWB) and Bluetooth Low Energy beacons deployed across Ramanujan Block and Library for indoor pathfinding and laboratory equipment tracking.',
      category: 'Smart Campus',
      leadDisplayName: 'Ananya Sharma',
      liveUrl: 'https://campus-nav-demo.aitpune.local',
      repoUrl: 'https://github.com/ait-indoor-nav',
      status: 'In Development',
      milestones: [
        { title: 'Beacon Propagation Modeling', completed: true, date: '2026-07-01' },
        { title: 'Mobile SDK & Floor Maps Digitization', completed: true, date: '2026-08-15' },
        { title: 'Final Year Building Integration', completed: false, date: '2026-11-01' },
      ],
      isDemo: true,
    },
  ];
}

export function getInitialOpportunities() {
  return [
    {
      id: 'opp_01',
      title: '[DEMO] Cloud Systems & Distributed Storage Engineering Internship',
      company: 'Microsoft India (Azure Team)',
      authorDisplayName: 'Priya Rathore',
      authorId: 'user_alumni_priya',
      role: 'Software Engineer Intern',
      location: 'Hyderabad / Hybrid',
      type: 'Internship (6 Months)',
      stipend: '₹85,000 / month',
      description: 'Exclusive referral and evaluation opportunity for AIT 3rd and 4th year students. Focus on high-throughput backend services, C++ / Golang, and distributed consensus.',
      deadline: '2026-11-15',
      isVerified: true, // Posted by verified alumni
      isDemo: true,
    },
    {
      id: 'opp_02',
      title: '[DEMO] Autonomous Drone Flight Control Research Grant & Fellowship',
      company: 'Defense Innovation Organization & AIT R&D Cell',
      authorDisplayName: 'Prof. K. S. Deshmukh',
      authorId: 'user_faculty_deshmukh',
      role: 'Student Research Fellow',
      location: 'AIT Campus Lab 304',
      type: 'Research Fellowship',
      stipend: '₹25,000 / month',
      description: 'Funded research position to assist with obstacle avoidance algorithms on micro-drones. Hands-on testing and flight tests conducted on campus grounds.',
      deadline: '2026-10-30',
      isVerified: true,
      isDemo: true,
    },
  ];
}
