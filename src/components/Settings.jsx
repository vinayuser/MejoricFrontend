import { Link } from "react-router-dom";

function Settings() {
  return (
    <div className="min-h-screen bg-teal-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-2xl">⚙️</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-white hover:text-green-200 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className="text-white hover:text-green-200 transition-colors"
              >
                Analytics
              </Link>
              <Link
                to="/settings"
                className="text-white hover:text-green-200 transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <h2 className="text-white text-2xl font-semibold mb-6">
            System Settings
          </h2>
          <div className="space-y-6">
            {/* System Configuration */}
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-white text-lg font-medium mb-4">
                System Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Panel Count
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Battery Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50"
                    placeholder="10 kWh"
                  />
                </div>
              </div>
            </div>
            {/* Notifications */}
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-white text-lg font-medium mb-4">
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-white">
                    Email alerts for system issues
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-white">Daily performance reports</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-white">Maintenance reminders</span>
                </label>
              </div>
            </div>
            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
