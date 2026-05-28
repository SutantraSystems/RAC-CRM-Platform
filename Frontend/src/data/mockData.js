export const leadsData = {
  New: [
    { id: 1, name: "Amit Kumar", country: "Canada", course: "MBA", date: "2024-01-15", score: 7.5, priority: "High" },
    { id: 2, name: "Pooja Verma", country: "UK", course: "MSc Data Science", date: "2024-01-18", score: 6.5, priority: "Medium" },
    { id: 3, name: "Karan Shah", country: "Australia", course: "BBA", date: "2024-01-20", score: 7.0, priority: "Low" },
  ],
  Contacted: [
    { id: 4, name: "Tanya Mishra", country: "USA", course: "MS Computer Science", date: "2024-01-10", score: 8.0, priority: "High" },
    { id: 5, name: "Aditya Rao", country: "Canada", course: "MEng", date: "2024-01-12", score: 7.0, priority: "Medium" },
  ],
  "In Progress": [
    { id: 6, name: "Simran Kaur", country: "UK", course: "LLM", date: "2024-01-05", score: 7.5, priority: "High" },
    { id: 7, name: "Dev Jain", country: "Germany", course: "MS Mechanical", date: "2024-01-08", score: 6.5, priority: "Low" },
    { id: 8, name: "Riya Bansal", country: "Australia", course: "MPH", date: "2024-01-09", score: 7.0, priority: "Medium" },
  ],
  Converted: [
    { id: 9, name: "Harsh Pandey", country: "Canada", course: "MBA Finance", date: "2023-12-20", score: 8.0, priority: "High" },
    { id: 10, name: "Nisha Agarwal", country: "USA", course: "MS AI", date: "2023-12-22", score: 9.0, priority: "High" },
  ],
  Lost: [
    { id: 11, name: "Varun Saxena", country: "UK", course: "MA Economics", date: "2023-12-01", score: 6.0, priority: "Low" },
    { id: 12, name: "Isha Chopra", country: "Australia", course: "BNursing", date: "2023-12-05", score: 6.5, priority: "Medium" },
  ],
};

export const dashboardStats = {
  totalLeads: 1250,
  activeStudents: 860,
  applicationsSubmitted: 430,
  offersReceived: 210,
  visaApproved: 180,
  pendingDocuments: 95,
  upcomingDeadlines: 34,
  revenueMetrics: "$45K",
  commission: "$12K",
};

export const revenueData = [
  { month: "Jan", revenue: 120000, target: 100000 },
  { month: "Feb", revenue: 145000, target: 120000 },
  { month: "Mar", revenue: 132000, target: 130000 },
  { month: "Apr", revenue: 178000, target: 150000 },
  { month: "May", revenue: 195000, target: 160000 },
  { month: "Jun", revenue: 220000, target: 180000 },
  { month: "Jul", revenue: 189000, target: 190000 },
  { month: "Aug", revenue: 245000, target: 200000 },
  { month: "Sep", revenue: 280000, target: 220000 },
  { month: "Oct", revenue: 310000, target: 250000 },
  { month: "Nov", revenue: 295000, target: 260000 },
  { month: "Dec", revenue: 340000, target: 280000 },
];

export const studentGrowthData = [
  { month: "Jan", students: 45, leads: 120 },
  { month: "Feb", students: 62, leads: 145 },
  { month: "Mar", students: 78, leads: 160 },
  { month: "Apr", students: 95, leads: 185 },
  { month: "May", students: 115, leads: 210 },
  { month: "Jun", students: 130, leads: 235 },
  { month: "Jul", students: 148, leads: 255 },
  { month: "Aug", students: 172, leads: 290 },
  { month: "Sep", students: 205, leads: 320 },
  { month: "Oct", students: 228, leads: 345 },
  { month: "Nov", students: 250, leads: 370 },
  { month: "Dec", students: 285, leads: 410 },
];

export const countryData = [
  { country: "Canada", value: 340, color: "#2c5aa9" },
  { country: "UK", value: 280, color: "#4a7fd4" },
  { country: "Australia", value: 220, color: "#ee3c3c" },
  { country: "USA", value: 180, color: "#f97316" },
  { country: "Germany", value: 120, color: "#22c55e" },
  { country: "New Zealand", value: 75, color: "#a855f7" },
  { country: "Ireland", value: 60, color: "#06b6d4" },
];

export const courseDistribution = [
  { name: "Computer Science", value: 285 },
  { name: "Business", value: 210 },
  { name: "Engineering", value: 195 },
  { name: "Medicine", value: 120 },
  { name: "Science", value: 98 },
  { name: "Arts", value: 65 },
  { name: "Design", value: 52 },
];

export const universitiesData = [
  { id: 1, name: "University of Toronto", country: "Canada", ranking: 25, programs: 180, students: 42, status: "Partner" },
  { id: 2, name: "University College London", country: "UK", ranking: 8, programs: 220, students: 68, status: "Partner" },
  { id: 3, name: "University of Melbourne", country: "Australia", ranking: 33, programs: 156, students: 55, status: "Active" },
  { id: 4, name: "MIT", country: "USA", ranking: 1, programs: 89, students: 12, status: "Partner" },
  { id: 5, name: "TU Munich", country: "Germany", ranking: 50, programs: 112, students: 28, status: "Active" },
  { id: 6, name: "University of Auckland", country: "New Zealand", ranking: 85, programs: 98, students: 19, status: "Active" },
];

export const applicationsData = [
  { id: 1, student: "Aanya Sharma", university: "University of Toronto", course: "MSc CS", status: "Offer Received", date: "2024-01-10", intake: "Sep 2024" },
  { id: 2, student: "Rohan Mehta", university: "University of Melbourne", course: "MEng", status: "Under Review", date: "2024-01-12", intake: "Jan 2025" },
  { id: 3, student: "Priya Nair", university: "University College London", course: "MBA", status: "Conditional Offer", date: "2024-01-08", intake: "Sep 2024" },
  { id: 4, student: "Arjun Patel", university: "University of Auckland", course: "MBBS PG", status: "Visa Approved", date: "2023-12-20", intake: "Jan 2025" },
  { id: 5, student: "Sneha Reddy", university: "MIT", course: "MS Biotech", status: "Under Review", date: "2024-01-15", intake: "Sep 2024" },
  { id: 6, student: "Vikram Singh", university: "University of Toronto", course: "MEng Civil", status: "Applied", date: "2024-01-18", intake: "May 2025" },
  { id: 7, student: "Kavya Krishnan", university: "University College London", course: "MSc Finance", status: "Offer Received", date: "2024-01-05", intake: "Sep 2024" },
];
