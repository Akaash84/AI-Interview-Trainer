import { Play, User } from "lucide-react";
import { motion } from "framer-motion";

function Session() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow-md bg-white">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">Logo</div>
          <select className="border rounded px-3 py-1 text-sm">
            <option>Resume</option>
            <option>Profile</option>
            <option>Settings</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <select className="border rounded px-3 py-1 text-sm">
            <option>Username</option>
            <option>Logout</option>
          </select>
        </div>
      </nav>

      {/* Main Section */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 max-w-7xl mx-auto w-full">
        {/* Left Side: Video + Metadata */}
        <div>
          <h1 className="text-3xl font-bold mb-4">Interview Title</h1>
          <div className="bg-black rounded-2xl aspect-video flex items-center justify-center mb-6">
            <motion.div whileHover={{ scale: 1.1 }}>
              <button className="rounded-full bg-blue-600 text-white p-6">
                <Play className="w-8 h-8" />
              </button>
            </motion.div>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div><span className="font-semibold">Topic:</span> AI Interviewer Name</div>
            <div><span className="font-semibold">Duration:</span> 35 mins</div>
            <div>
              <span className="font-semibold">Description:</span>
              <p className="text-gray-600 mt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus laoreet rutrum
                lobortis. Etiam lobortis auctor velit tempus posuere. Vestibulum sodales turpis rutrum
                velit rhoncus gravida.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Report */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Report</h2>
            <div className="text-sm text-gray-500">Jan 12, 2025</div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Positives</h3>
            <p className="text-gray-600 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus laoreet rutrum lobortis.
              Etiam lobortis auctor velit tempus posuere. Vestibulum sodales turpis rutrum velit rhoncus gravida.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Negatives</h3>
            <p className="text-gray-600 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus laoreet rutrum lobortis.
              Etiam lobortis auctor velit tempus posuere. Vestibulum sodales turpis rutrum velit rhoncus gravida.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Key Areas (Timestamps)</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Lorem ipsum dolor sit amet – 02:13</li>
              <li>Vivamus laoreet rutrum lobortis – 08:45</li>
              <li>Etiam lobortis auctor velit tempus posuere – 14:22</li>
              <li>Vestibulum sodales turpis rutrum – 21:10</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Session;
