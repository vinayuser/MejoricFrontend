import { Link } from "react-router-dom";

function Analytics() {
  return (
    <div className="min-h-screen bg-blue-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-2xl">📊</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-white hover:text-blue-200 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className="text-white hover:text-blue-200 transition-colors"
              >
                Analytics
              </Link>
              <Link
                to="/settings"
                className="text-white hover:text-blue-200 transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 mb-8">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Performance Analytics
          </h2>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Peak Performance</h3>
              <p className="text-white text-3xl font-bold">96.8%</p>
              <p className="text-white/70 text-sm">Last 30 days</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Average Output</h3>
              <p className="text-white text-3xl font-bold">85 kWh</p>
              <p className="text-white/70 text-sm">Per day</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">CO2 Saved</h3>
              <p className="text-white text-3xl font-bold">2.3 tons</p>
              <p className="text-white/70 text-sm">This month</p>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                Monthly Trends
              </h3>
              <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                <p className="text-white/70">Monthly Performance Chart</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                Efficiency Over Time
              </h3>
              <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                <p className="text-white/70">Efficiency Chart</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analytics;
