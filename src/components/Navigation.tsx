import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-900">
          ZeitiosAI
        </Link>
        <div className="space-x-4">
          <Link to="/">
            <Button variant="ghost">Learning Assistant</Button>
          </Link>
          <Link to="/course-video">
            <Button variant="ghost">Course Video Generator</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}; 