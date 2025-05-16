<<<<<<< Updated upstream
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
=======
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-lg font-semibold text-[#2866C5] hover:text-[#2866C5]/80"
          >
            ZeitiosAI
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/upload')}
            className="text-gray-600 hover:text-gray-900"
          >
            Upload Course
          </Button>
        </div>
      </div>
    </nav>
>>>>>>> Stashed changes
  );
};

export default NavBar; 