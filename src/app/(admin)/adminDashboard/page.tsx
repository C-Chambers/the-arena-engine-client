// src/app/(admin)/adminDashboard/page.tsx

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-300">
        Welcome to the administrative panel. Please select a management option from the sidebar to begin.
      </p>
      <div className="mt-8 p-6 bg-gray-900 rounded-lg">
        <h2 className="text-xl font-semibold">Current Status</h2>
        <p className="mt-2 text-gray-400">
          All systems are operational. You can manage characters, skills, and missions from the navigation on the left.
        </p>
      </div>
    </div>
  );
}
