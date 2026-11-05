import { Routes, Route } from 'react-router-dom';
import LocationList from './LocationList';
import LocationForm from './LocationForm';
 

export default function LocationPage() {
  return (
    <>
      <main className="flex-1 rounded p-4 min-h-[60vh]">
        <Routes>
          <Route path="/" element={<LocationList />} />
          <Route path="nuevo" element={<LocationForm />} />
          <Route path="ver/:id" element={<LocationForm mode="view" />} />
          <Route path="editar/:id" element={<LocationForm  mode="edit" />} />
        </Routes>
      </main>
    </>
  );
}
