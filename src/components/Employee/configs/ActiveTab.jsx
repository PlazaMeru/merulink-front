import PersonalData from '../tabs/PersonalData';
import WorkData from '../tabs/WorkData';
import ContactData from '../tabs/ContactData';
import BankInformation from '../tabs/BankInformation';
import MeruLinkData from '../tabs/meruLinkData';
import HidCard from '../tabs/HidCard';
import LockerAssign from '../tabs/LockerAssign';
import Absence from '../tabs/Absence';

/**
 * Renderiza la pestaña activa del formulario de empleado.
 * Inyecta props que NO vienen de react-hook-form (pantalla/dominio).
 */
export default function ActiveTab({
  activeTab,
  mode,
  createMode,
  viewMode,
  isEmployeeActive,
  disabledClasses,
  employee,
  departments,
  loadingData,
  selectedDepartmentId,
  subDepartments,
  positions,
  empLockerAssign,
  selectedSex,
}) {
  switch (activeTab) {
    case 'personal':
      return <PersonalData createMode={createMode} viewMode={viewMode} isEmployeeActive={isEmployeeActive} employee={employee} disabledClasses={disabledClasses} />;

    case 'work':
      return (
        <WorkData
          viewMode={viewMode}
          disabledClasses={disabledClasses}
          employee={employee}
          availableDepartments={departments}
          loadingData={loadingData}
          selectedDepartmentId={selectedDepartmentId}
          subDepartments={subDepartments}
          positions={positions}
        />
      );

    case 'contact':
      return <ContactData viewMode={viewMode} />;

    case 'bankInformation':
      return <BankInformation viewMode={viewMode} />;

    case 'meruLink':
      return (
        <MeruLinkData
          createMode={createMode}
          viewMode={viewMode}
          isEmployeeActive={isEmployeeActive}
          disabledClasses={disabledClasses}
          employee={employee}
        />
      );

    case 'hidCard':
      return (
        <HidCard
          createMode={createMode}
          viewMode={viewMode}
          isEmployeeActive={isEmployeeActive}
          disabledClasses={disabledClasses}
          employee={employee}
        />
      );

    case 'lockerAssign':
      return (
        <LockerAssign
          mode={mode}
          empLockerAssign={empLockerAssign}
          selectedSex={selectedSex}
          isEmployeeActive={isEmployeeActive}
          disabledClasses={disabledClasses}
        />
      );

  case 'absence':
    return (
      <Absence
        viewMode={viewMode}
        disabledClasses={disabledClasses}
        employee={employee}
      />
    );

    default:
      return null;
  }
}
