function ButtonCancel({ onClose, text = 'Cancelar' }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
    >
      {text}
    </button>
  ); 
}

export default ButtonCancel;