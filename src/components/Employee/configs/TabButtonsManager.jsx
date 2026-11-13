import { useAuth } from '../../../context/AuthContext';

import { tabs } from '../../../utils/tabs-utils';

import TabButtons from '../../Shared/TabButtons';
import CarouselTabs from '../../Shared/CarouselTabs';

export default function TabButtonsManager({ activeTab, setActiveTab, errors }) {
  const { user } = useAuth();

  const visibleTabs = tabs.filter((tab) => {
      if (tab.id === 'meruLink') {
          return user?.permissions?.includes('manage-merulink-tab-employees');
      }
      if (tab.id === 'absence') {
          return user?.permissions?.includes('manage-absences-tab-employees');
      }
      return true;
  });

  // Determina si una pestaña tiene errores de formulario
  const getTabError = (tab) => {
      if (!errors) return false;

      const personalKeys = ['numEmployee','birthdate','placeOfBirth','nationality','age', 'sex','ci','maritalStatus','bloodType','email','mobilePhone','homePhone','address'];
      const workKeys = ['joinDate','department','subDepartment','position'];
      const meruLinkKeys = ['userName', 'userPass', 'roleId', 'departmentCollectedIds'];
      const lockerAssignKeys = ['lockerAssingId'];

      if (tab.id === 'personal') return personalKeys.some(k => Object.prototype.hasOwnProperty.call(errors, k));
      if (tab.id === 'work') return workKeys.some(k => Object.prototype.hasOwnProperty.call(errors, k));
      if (tab.id === 'contact') return !!errors.contacts;
      if (tab.id === 'bankInformation') return !!errors.bankInformation;
      if (tab.id === 'meruLink') return meruLinkKeys.some(k => Object.prototype.hasOwnProperty.call(errors, k));
      if (tab.id === 'lockerAssign') return lockerAssignKeys.some(k => Object.prototype.hasOwnProperty.call(errors, k));
      return false;
  };

  return (
    <CarouselTabs
      items={visibleTabs}
      activeId={activeTab}
      onSelect={setActiveTab}
      className="mt-6 border-b border-gray-700"
      getLabel={(tab) => tab.label}
      renderItem={(tab, { onSelect }) => (
        <TabButtons
          tabId={tab.id}
          setActiveTab={onSelect}
          activeTab={activeTab}
          tabLabel={tab.label}
          tabError={getTabError(tab)}
        />
      )}
    />
  );
}