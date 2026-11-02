import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from 'react-router-dom';
const AssistantInput = lazy(() => import("./AssistantInput"));
const DepartmentPage = lazy(() => import("./Department/DepartmentPage"));
const SubDepartmentPage = lazy(() => import("./SubDepartment/SubDepartmentPage"));
const PositionPage = lazy(() => import("./Positions/PositionPage"));
const LocationList = lazy(() => import("./Location/LocationList"));
const RolePage = lazy(() => import("./Role/RolePage"));
const LockerRoomPage = lazy(() => import("./LockerRoom/LockerRoomPage"));
const PadlockPage = lazy(() => import("./Padlock/PadlockPage"));
const EventsPage = lazy(() => import("./Events/EventsPage"));
const DefaultWorkspace = lazy(() => import("./DefaultWorkspace"));
const PadlockPatternPage = lazy(() => import("./PadlockPattern/PadlockPatternPage"));
const ShiftPage = lazy(() => import("./Shift/ShiftPage"));
const SchedulePage = lazy(() => import("./Schedule/SchedulePage"));
const LockerAssignPage = lazy(() => import("./LockerAssign/LockerAssignPage"));
const EmployeePage = lazy(() => import("./Employee/EmployeePage"));
const Calendar = lazy(() => import("./Calendar/Calendar"));
const Login = lazy(() => import("./Login"));
const ChangePassword = lazy(() => import("./ChangePassword"));
const ForbiddenPage = lazy(() => import("./Shared/ForbiddenPage"));

import { EventProvider } from "../context/EventContext";
import { LockerRoomProvider } from "../context/LockerRoomContext";
import { PadlockProvider } from "../context/PadlockContext";
import { LockerAssignProvider } from "../context/LockerAssignContext";
import { EmployeeProvider } from '../context/EmployeeContext'; 
import { AbsenceProvider } from '../context/AbsenceContext'; 
import { ListStateProvider } from '../context/ListStateContext';
import { DepartmentProvider } from '../context/DepartmentContext'; 
import { SubDepartmentProvider } from '../context/SubDepartmentContext'; 
import { PositionProvider } from '../context/PositionContext'; 
import { LocationProvider } from '../context/LocationContext';
import { RoleProvider } from '../context/RoleContext'; 
import { PadlockPatternProvider } from '../context/PadlockPatternContext'; 
import { ShiftProvider } from '../context/ShiftContext'; 
import { ScheduleProvider } from '../context/ScheduleContext'; 
import { useNotification } from "../context/NotificationContext";
import ProtectedRoute from './Shared/ProtectedRoute';
import MainLayout from './Shared/MainLayout';
import LoadingSpinner from './Shared/LoadingSpinner';
import HomePage from "./HomePage";

const EventLayout = ({ showNotification }) => (
  <EventProvider showNotification={showNotification}>
    <Outlet />
  </EventProvider>
);

const LockerLayout = () => (
  <LockerRoomProvider>
    <Outlet />
  </LockerRoomProvider>
);

const PadlockLayout = () => (
  <PadlockProvider>
    <Outlet />
  </PadlockProvider>
);

const LockerAssignLayout = () => (
  <LockerAssignProvider>
    <Outlet />
  </LockerAssignProvider>
);

const EmployeeLayout = () => (
  <ListStateProvider>
    <EmployeeProvider>
      <AbsenceProvider>
        <Outlet />
      </AbsenceProvider>
    </EmployeeProvider>
  </ListStateProvider>
);

const DepartmentLayout = () => (
  <ListStateProvider>
    <DepartmentProvider>
      <Outlet />
    </DepartmentProvider>
  </ListStateProvider>
)

const SubDepartmentLayout = () => (
  <ListStateProvider>
    <SubDepartmentProvider>
      <Outlet />
    </SubDepartmentProvider>
  </ListStateProvider>
);

const PositionLayout = () => (
  <ListStateProvider>
    <PositionProvider>
      <Outlet />
    </PositionProvider>
  </ListStateProvider>
);

const LocationLayout = () => (
  <ListStateProvider>
    <LocationProvider>
      <Outlet />
    </LocationProvider>
  </ListStateProvider>
);

const RoleLayout = () => (
  <RoleProvider>
    <Outlet />
  </RoleProvider>
);

const PadlockPatternLayout = () => (
  <PadlockPatternProvider>
    <Outlet />
  </PadlockPatternProvider>
);

const ShiftLayout = () => (
  <ShiftProvider>
    <Outlet />
  </ShiftProvider>
);

const ScheduleLayout = () => (
  <ListStateProvider>
    <ScheduleProvider>
      <Outlet />
    </ScheduleProvider>
  </ListStateProvider>
);

export default function Workspace() {
  const { showNotification } = useNotification();
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-screen" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cambiar-contrasena" element={<ChangePassword />} />

        <Route path="/" element={<HomePage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/403" element={<ForbiddenPage  />} />

        
            <Route path="/ia" element={<div className="ia-workspace"><AssistantInput /></div>} />

            {/* RRHH */}
            <Route element={<EmployeeLayout />}>
              <Route path="/empleados/*" element={<div className="main-workspace"><EmployeePage /></div>} />
            </Route>

            {/* Departamentos */}
            <Route element={<DepartmentLayout />}>
              <Route path="/empleados/departamentos/*" element={<div className="main-workspace"><DepartmentPage /></div>} />
            </Route>
            
            {/* Sub-Departamentos */}
            <Route element={<SubDepartmentLayout />}>
              <Route path="/empleados/sub-departamentos/*" element={<div className="main-workspace"><SubDepartmentPage /></div>} />
            </Route>
            
            {/* Cargos */}
            <Route element={<PositionLayout />}>
              <Route path="/empleados/cargos/*" element={<div className="main-workspace"><PositionPage /></div>} />
            </Route>

            {/* Roles */}
            <Route element={<RoleLayout />}>
              <Route path="/empleados/roles/*" element={<div className="main-workspace"><RolePage /></div>} />
            </Route>

            {/* Turnos */}
            <Route element={<ShiftLayout />}>
              <Route path="/empleados/turnos/*" element={<div className="main-workspace"><ShiftPage /></div>} />
            </Route>

            {/* Horarios */}
            <Route element={<ScheduleLayout />}>
              <Route path="/empleados/horarios/*" element={<div className="main-workspace"><SchedulePage /></div>} />
            </Route>
            
            {/* Locker Room */}
            <Route element={<LockerLayout />}>
              <Route path="/empleados/vestuarios/lockers/*" element={<div className="main-workspace"><LockerRoomPage/></div> } />
            </Route>

            {/* Padlock */}
            <Route element={<PadlockLayout />}>
              <Route path="/empleados/vestuarios/candados/*" element={<div className="main-workspace"><PadlockPage/></div> } />
            </Route>

            {/* Padlock Pattern */}
            <Route element={<PadlockPatternLayout />}>
              <Route path="/empleados/vestuarios/candados/patrones/*" element={<div className="main-workspace"><PadlockPatternPage/></div> } />
            </Route>

            {/* LockerAssign */}
            <Route element={<LockerAssignLayout />}>
              <Route path="/empleados/vestuarios/casilleros/*" element={<div className="main-workspace"><LockerAssignPage/></div> } />
            </Route>

            <Route element={<LocationLayout />}>
              <Route path="/eventos/localizaciones/*" element={<div className="main-workspace"><LocationList /></div>} />
            </Route>

            {/* Calendario - Eventos */}
            <Route element={<EventLayout showNotification={showNotification} />}>
              <Route path="/eventos/*" element={<div className="main-workspace"><EventsPage /></div>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<DefaultWorkspace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}