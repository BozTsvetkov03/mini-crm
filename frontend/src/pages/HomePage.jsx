import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center px-6">
      
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Manage your customers. Grow your business.
      </h1>

      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
        A lightweight CRM to track customer interactions and stay organized.
      </p>

      <button
        onClick={() => navigate("/register")}
        className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-emerald-400 transition hover:cursor-pointer"
      >
        Get Started
      </button>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <Feature
          title="Simple"
          text="No bloated features. Just what you need."
        />
        <Feature
          title="Fast"
          text="Built for speed and efficiency."
        />
        <Feature
          title="Focused"
          text="Designed to help you stay on top of your customers."
        />
      </div>
    </div>
  );
}

function Feature({title, text}) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}