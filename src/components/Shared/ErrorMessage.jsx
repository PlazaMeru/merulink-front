function ErrorMessage({msg, dynamicClasses}) {
  return (
    <p className={`text-red-400 text-xs mt-1 ${dynamicClasses}`}>{msg}</p>
  );
}

export default ErrorMessage;