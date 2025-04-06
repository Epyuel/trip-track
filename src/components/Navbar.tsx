import { HiMenu } from "react-icons/hi"; 

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => { 
  
  return (
    <nav className="sticky top-0 bg-white border-b-2 flex items-center justify-between px-6 py-3 z-20">
      <div className="flex items-center relative w-80">
        <button
          className="md:hidden mr-4"
          onClick={onMenuClick}
          aria-label="Menu-Icon"
        >
          <HiMenu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <a href='/' className="flex items-center space-x-2 text-sm text-gray-700 focus:outline-none">
            <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-white">
              E
            </div>
            <span className="hidden sm:inline">Eyuel Demrew</span> 
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
