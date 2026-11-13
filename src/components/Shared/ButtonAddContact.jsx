import { PlusIcon } from '@heroicons/react/24/solid';

function ButtonAddContact({ disabled, handleAddContact, addContacts, dynamicClasses, text = 'Agregar Contacto' }) {
  return (
    <button
      disabled={disabled}
      type="button"
      onClick={handleAddContact}
      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${!addContacts && 'cursor-not-allowed opacity-50'} ${dynamicClasses}`} 
    >
      <PlusIcon className="w-4 h-4" />
      {text}
    </button>
  );
}

export default ButtonAddContact;