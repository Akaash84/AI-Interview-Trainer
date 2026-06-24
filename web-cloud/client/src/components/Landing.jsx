import { Play } from "lucide-react";
import { motion } from "framer-motion";

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow-md bg-white">
        <div className="text-xl font-bold">Logo</div>
        <div className="space-x-2">
          <button className="border px-4 py-2 rounded-lg">Sign Up</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-16 px-6 bg-gray-50">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Ready to Ace Your Next Interview
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          AI mock interviews with personalized practice and real-time analytics
          – everything to interview smarter.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} className="mb-6">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl">
            <Play className="w-5 h-5" /> Watch Demo
          </button>
        </motion.div>
        <div className="space-x-3">
          <button className="border px-4 py-2 rounded-lg">
            Still Having Doubts?
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Contact Us
          </button>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-12 px-6 bg-white">
        <h2 className="text-2xl font-bold text-center mb-8">
          Key Benefits with Interview Trainer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            "Unlimited Interview Practice",
            "AI Topic-Specific Feedback",
            "Resume-Based Interview Prep",
            "Job Description Based Interview",
            "AI Mock Q&A",
            "Interview DEI Fairness Analyzer",
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow-sm border p-4 text-center font-medium"
            >
              {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-8">How it Works?</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            "Select your desired role and other interview details to start practicing.",
            "Practice in real-time with live follow-up questions.",
            "Get actionable feedback based on industry-standard metrics.",
            "Track and improve your performance through mock practices.",
          ].map((step, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-4 flex items-start gap-3"
            >
              <div className="font-bold text-lg">{idx + 1}</div>
              <p>{step}</p>
            </div>
          ))}
          <motion.div whileHover={{ scale: 1.05 }} className="flex justify-center">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl">
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-6 bg-white">
        <h2 className="text-2xl font-bold text-center mb-8">Testimonials</h2>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border p-6">
            <p className="text-gray-600 mb-4">
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Interview Trainer helped me prepare with confidence and get my
              dream job!"
            </p>
            <div className="font-bold">User Name</div>
            <div className="text-sm text-gray-500">Software Engineer</div>
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-white mb-2">Interview Trainer</h3>
            <p className="text-sm">
              Helping you succeed in your next interview.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>About</li>
              <li>Features</li>
              <li>Pricing</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Follow Us</h4>
            <ul className="space-y-1 text-sm">
              <li>Twitter</li>
              <li>LinkedIn</li>
              <li>Facebook</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
