import { PencilIcon } from "@heroicons/react/24/solid";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HeadFormButtons({ onBack, url = '', data = null, setIsEditing, disabled }) {
  const navigate = useNavigate();

  const handleEditClick = () => {

    if (typeof setIsEditing === 'function') {
      setIsEditing(true);
      return;
    }

    if (url && data) {
      navigate(url, { state: { data: data } });
    }
  };

  return (
    <div className="buttons-bar flex gap-2 items-center justify-end mb-2">
      <button
        disabled={disabled} 
        type="button"
        onClick={handleEditClick} 
        className="buttons-bar-btn flex text-3xl font-semibold" 
        title="Editar"
      >
        <PencilIcon className="w-4 h-4 text-white" />
      </button>
      <button 
        type="button" 
        onClick={() => (typeof onBack === 'function' ? onBack() : navigate(-1))} 
        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

export default HeadFormButtons;