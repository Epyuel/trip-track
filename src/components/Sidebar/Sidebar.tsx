'';
import { HiX } from "react-icons/hi";
import { FiChevronsLeft } from "react-icons/fi";
import { useEffect, useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaMapMarkerAlt } from "react-icons/fa";

import { IoOptionsOutline } from "react-icons/io5";
import { Button } from "../../ui/buttonPrimary";
import useNavigation from "../../hooks/useNavigation";
import SidebarLink from "./SidebarLinks";

interface Props {
  open: boolean;
  onClose: React.MouseEventHandler<HTMLSpanElement>;
  collapse: boolean;
  onCollapse: React.MouseEventHandler<HTMLSpanElement>;
}
interface ILink {
  title: string;
  icon: React.ElementType;
  link: string;
  isActive: boolean;
  collapsed: boolean;
}


const Sidebar: React.FC<Props> = ({ open, onClose, collapse, onCollapse }) => {
  const {
    isELDlogsActive,
    isMapActive,
  } = useNavigation();

  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [showAccountOptions, setShowAccountOptions] = useState<boolean>(false);

  useEffect(() => {

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize); 
  }, []);


  const links: ILink[] = [
    {
      title: "ELD Logs",
      icon: LuLayoutDashboard,
      link: "/",
      isActive: isELDlogsActive,
      collapsed: collapse,
    },
    {
      title: "Map",
      icon: FaMapMarkerAlt,
      link: "/map",
      isActive: isMapActive,
      collapsed: collapse,
    },
  ];


  const getLinks = () => {
    return (
      links
    );
  };

  return (
    <div
      className={`sm:none duration-175 linear fixed z-50 flex flex-col pb-10 bg-[#f2fffe] shadow-white/5 transition-all min-h-screen ${
        open ? "translate-x-0" : "-translate-x-96"
      } ${collapse ? "w-[90px]" : "w-[260px]"} ${
        open && isSmallScreen ? "!z-40" : ""
      } overflow-y-auto`}
    >
      <span
        className="absolute top-5 right-5 block cursor-pointer md:hidden"
        onClick={onClose}
        aria-label="Sidebar-Close-Icon"
      >
        <HiX className="h-[40px] w-[40px]" />
      </span>

      <div className={`h-[110px] w-full flex items-center px-6 overflow-hidden`}>
        <div
          className={`text-3xl font-bold ${collapse ? "opacity-0" : "opacity-100"}`}
        >
        <span className="text-[#84D0CC]">Trip</span><span className="text-[#FFA07A]">Track</span>
        <hr />
        </div>
      </div>

      {getLinks().map((link: ILink, index: number) => {
        return (
          <SidebarLink
            title={link.title}
            Icon={link.icon}
            link={link.link}
            isActive={link.isActive}
            collapsed={link.collapsed}
            key={index}
          />
        );
      })}

      <hr className="my-5 mx-5" />
      <span
        className="my-2 mx-auto cursor-pointer hidden md:block"
        onClick={onCollapse}
        aria-label="Collapse-Icon"
      >
        <FiChevronsLeft size={30} className={`${collapse ? "rotate-180" : ""}`} />
      </span>

      {/* New Account Options Popover Trigger */}
      <div className="relative flex justify-center items-center">
        <span
          className="cursor-pointer"
          onClick={() => setShowAccountOptions((prev) => !prev)}
          aria-label="Account-options-icon"
        >
          <IoOptionsOutline size={30} />
        </span>
        {showAccountOptions && (
          <div className="absolute -bottom-32 flex flex-col items-center justify-center gap-3 p-2 rounded">
            <Button 
                onClick={()=>{}} 
                className="w-fit mx-auto text-white bg-[#fca27e]"
            >
                Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
