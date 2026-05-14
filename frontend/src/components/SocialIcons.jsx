import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const ownerNumber = "919047512640"; // WhatsApp number
const ownerInstagram = "abdularavin"; // Instagram username

const SocialIcons = () => {
  return (
    <>
{/* Social Icons (fixed on bottom-left, above footer) */}
<div className="fixed left-4 bottom-4 flex flex-row gap-4 z-50">
  {/* WhatsApp Icon */}
  <a
    href={`https://wa.me/${ownerNumber}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-green-500 text-white p-5 rounded-full shadow-lg hover:bg-green-600 transition-colors text-3xl flex items-center justify-center"
  >
    <FaWhatsapp />
  </a>

  {/* Instagram Icon */}
  <a
    href={`https://instagram.com/${ownerInstagram}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-pink-500 text-white p-5 rounded-full shadow-lg hover:bg-pink-600 transition-colors text-3xl flex items-center justify-center"
  >
    <FaInstagram />
  </a>
</div>


    </>
  );
};

export default SocialIcons;
