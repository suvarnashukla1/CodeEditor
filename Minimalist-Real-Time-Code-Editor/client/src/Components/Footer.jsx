import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
  <footer className="py-4 absolute bottom-0 left-0 right-0 flex justify-center text-sm gap-3"><div className="flex justify-center gap-5"><h1>made with love by <b>Suvarna</b></h1>
        <h1 className="flex items-center gap-2">
          Github: 
          <a 
            href="https://github.com/suvarnashukla1" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#a08521]"
          >
            <FaGithub size={20} />
          </a>
        </h1>
      </div>
    </footer>
  );
};

export default Footer;