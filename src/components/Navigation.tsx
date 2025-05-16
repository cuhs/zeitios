import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const tabs = [
    { name: 'AI Tutor', path: '/' },
    { name: 'Course Upload', path: '/course-upload' },
    { name: 'Curriculum Upload', path: '/curriculum-upload' },
  ];

  return (
    <div className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-black mr-12">
              Zeitios<span className="font-light">AI</span>
            </span>
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "relative py-5 font-medium text-sm tracking-wide transition-colors",
                    location.pathname === tab.path
                      ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black"
                      : "text-gray-500 hover:text-black"
                  )}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation; 