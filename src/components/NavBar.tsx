import { useLocation, Link } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  
  return (
    <div className="w-full fixed top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center">
          <div className="bg-white rounded-full p-1 inline-flex shadow-sm">
            <Link 
              to="/" 
              className={`text-lg transition-all duration-200 px-6 py-2 rounded-full ${
                location.pathname === '/' 
                  ? 'font-bold bg-[#2866C5] text-white' 
                  : 'text-gray-600 hover:text-[#2866C5]'
              }`}
            >
              🏠 Home
            </Link>
            <Link 
              to="/course-upload" 
              className={`text-lg transition-all duration-200 px-6 py-2 rounded-full ${
                location.pathname === '/course-upload' 
                  ? 'font-bold bg-[#2866C5] text-white' 
                  : 'text-gray-600 hover:text-[#2866C5]'
              }`}
            >
              📚 Course Upload
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar; 