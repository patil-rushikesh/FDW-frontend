import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content with a slight delay for dramatic effect
    setTimeout(() => setShowContent(true), 600);

    // Calculate the interval needed to reach 100% in exactly 6 seconds
    // 100 steps ÷ 6 seconds = ~16.67 steps per second
    // 1000ms ÷ 16.67 = ~60ms per step
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        // Make the progress bar slightly accelerate at start and decelerate at end
        // for a more natural feel
        if (prev < 100) {
          if (prev < 20) {
            // Start a bit slower
            return prev + 0.8;
          } else if (prev > 80) {
            // End a bit slower
            return prev + 0.8;
          } else {
            // Middle part at normal speed
            return prev + 1;
          }
        }
        return prev;
      });
    }, 60);

    // Redirect to profile page after 6 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 1500);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  // Calculate the loading progress bar width with smooth easing
  const progressWidth = loadingProgress + "%";

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-950">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.7,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite alternate`,
            }}
          ></div>
        ))}
      </div>

      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-3xl animate-blob1 left-1/4 top-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl animate-blob2 right-1/4 bottom-1/4"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-blob3 left-1/3 bottom-1/3"></div>
        <div className="absolute w-[450px] h-[450px] bg-cyan-500/20 rounded-full blur-3xl animate-blob4 right-1/3 top-1/3"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite linear`,
              opacity: Math.random() * 0.7,
            }}
          ></div>
        ))}
      </div>

      {/* Main content container */}
      <div className="relative h-full w-full flex flex-col items-center justify-center">
        <div
          className={`text-center space-y-8 transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Logo container with enhanced glow effect */}
          <div className="mb-8 relative group">
            <div className="absolute inset-0 animate-pulse-slow">
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
            <div className="absolute inset-0 animate-glow filter blur-md">
              <svg
                className="w-32 h-32 mx-auto text-blue-300 opacity-70"
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
              className="w-32 h-32 mx-auto text-white relative z-10 transition-transform duration-500 group-hover:scale-110"
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
            {/* Light rays effect */}
            <div className="absolute inset-0 w-full h-full opacity-70">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-24 bg-gradient-to-t from-blue-400 to-transparent opacity-0"
                  style={{
                    left: "50%",
                    top: "50%",
                    transformOrigin: "bottom center",
                    transform: `rotate(${45 * i}deg) translateY(-50px)`,
                    animation: `lightray 3s ${i * 0.2}s infinite alternate`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Title with enhanced gradient text */}
          <div className="space-y-4">
            <h1
              className="text-5xl font-bold text-transparent bg-clip-text animate-gradient-fast"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #4facfe, #00f2fe, #a6ffcb, #dce0ff)",
                backgroundSize: "300% 100%",
              }}
            >
              Teachers' Appraisal System
            </h1>
            <p className="text-blue-200 text-xl animate-fade-in-up delay-300 relative inline-block">
              <span className="relative z-10">
                Excellence in Education Evaluation
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-transparent transform scale-x-0 origin-left transition-transform animate-expand-line"></span>
            </p>
          </div>

          {/* Enhanced Progress bar */}
          <div className="mt-12 w-64 mx-auto relative">
            <div className="h-2 w-full bg-blue-900/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
              <div
                className="h-full rounded-full relative overflow-hidden transition-all duration-600 ease-out"
                style={{
                  width: progressWidth,
                  background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                }}
              >
                <span className="absolute inset-0 bg-white/30 animate-shimmer"></span>
              </div>
            </div>
            <p className="text-blue-200 mt-2 text-sm flex justify-between items-center">
              <span className="animate-pulse-slow">Loading</span>
              <span className="font-mono">{Math.round(loadingProgress)}%</span>
            </p>
          </div>

          {/* Add developed by text */}
          <div className="mt-8 text-blue-200/80 text-sm">
            <p>Developed by Team AANSH</p>
            <p className="mt-1 text-xs font-medium text-blue-300/70">
              YOUR VISION OUR CODE
            </p>
          </div>
        </div>
      </div>

      {/* Add floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-blue-300/30 rounded-lg"
            style={{
              width: Math.random() * 100 + 50 + "px",
              height: Math.random() * 100 + 50 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float-rotate ${Math.random() * 15 + 15}s infinite linear`,
              transform: `rotate(${Math.random() * 360}deg) translateY(0px)`,
            }}
          ></div>
        ))}
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, 10px);
          }
          50% {
            transform: translate(0, 20px);
          }
          75% {
            transform: translate(-10px, 10px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes lightray {
          0% {
            opacity: 0;
            height: 0;
          }
          50% {
            opacity: 0.6;
            height: 60px;
          }
          100% {
            opacity: 0;
            height: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float-rotate {
          0% {
            transform: rotate(0deg) translateY(0);
          }
          25% {
            transform: rotate(90deg) translateY(20px);
          }
          50% {
            transform: rotate(180deg) translateY(0);
          }
          75% {
            transform: rotate(270deg) translateY(-20px);
          }
          100% {
            transform: rotate(360deg) translateY(0);
          }
        }

        .animate-gradient-fast {
          animation: gradient 3s ease infinite;
          background-size: 300% 100%;
        }

        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-blob1 {
          animation: blob 10s infinite alternate;
        }

        .animate-blob2 {
          animation: blob 13s infinite alternate-reverse;
        }

        .animate-blob3 {
          animation: blob 8s infinite alternate;
        }

        .animate-blob4 {
          animation: blob 15s infinite alternate-reverse;
        }

        .animate-expand-line {
          animation: expandLine 2s 1s forwards;
        }

        @keyframes expandLine {
          to {
            transform: scaleX(1);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(5%, -5%) scale(1.1);
          }
          66% {
            transform: translate(-5%, 5%) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;