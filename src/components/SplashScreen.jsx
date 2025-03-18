import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => (prev < 100 ? prev + 1 : prev));
    }, 30);

    // Redirect to profile page after 3.5 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3500);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-blob1 left-1/4 top-1/4"></div>
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl animate-blob2 right-1/4 bottom-1/4"></div>
        <div className="absolute w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl animate-blob3 left-1/3 bottom-1/3"></div>
      </div>

      {/* Main content container */}
      <div className="relative h-full w-full flex flex-col items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Logo container with glow effect */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 animate-glow">
              <svg
                className="w-32 h-32 mx-auto text-blue-400 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <svg
              className="w-32 h-32 mx-auto text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          {/* Title with gradient text */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-white text-transparent bg-clip-text animate-gradient">
              Teachers' Appraisal System
            </h1>
            <p className="text-blue-200 text-xl animate-fade-in-up delay-200">
              Excellence in Education Evaluation
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-12 w-64 mx-auto">
            <div className="h-1 w-full bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-100 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-blue-200 mt-2 text-sm">
              Loading... {loadingProgress}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;