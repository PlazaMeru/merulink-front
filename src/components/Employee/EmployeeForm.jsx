import { useEffect, useState } from 'react';
import { User } from "lucide-react";
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployees } from '../../context/EmployeeContext';
import { useGlobalData } from '../../context/GlobalDataContext';

import { getDisabledClasses, splitPhone } from '../../utils/global-utils';  
import { employeeValidationSchema } from '../../utils/Validations/employeeValidationSchema';
import { calculateAge } from '../../utils/calculateAge-utils';
import { newNumEmployee } from '../../utils/Employees/employee-utils';
import { formatCI } from '../../utils/text-utils';
import { tabs } from '../../utils/tabs-utils';
import { mobilePhoneCodes } from '../../utils/StaticData/phoneCodes-utils';

import ActiveTab from "./configs/ActiveTab";
import TabButtonsManager from './configs/TabButtonsManager';

import FooterFormButtons from '../Shared/FooterFormButtons';
import HeadFormButtons from '../Shared/HeadFormButtons';
import TitleHeader from '../Shared/TitleHeader';
import HeaderEmployeeForm from './HeaderEmployeeForm';
import EmployeeScraperModal from './modals/EmployeeScraperModal';
import HasPermission from '../Shared/HasPermission';
import EmployeeTopBar from './EmployeeTopBar';

import '../../Tables.css';

export default function EmployeeForm({ mode = 'create' }) {
  
  const { employeeData, createEmployee, updateEmployee, getLockerAssigns, loadingEmployeeData, loadingChangeStatus } = useEmployees();
  const { filteredDepartments } = useGlobalData();
  
  const { id } = useParams();
  const employee = employeeData.find(e => e.id === Number(id));
  const editMode = mode === 'edit';
  const createMode = mode === 'create';
  const viewMode = mode === 'view';

  const methods = useForm({
    resolver: yupResolver(employeeValidationSchema({ isEditMode: editMode })),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = methods;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [lockerAssigns, setLockerAssigns] = useState([]);
  const [empLockerAssign, setEmpLockerAssign] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [subDepartments, setSubDepartments] = useState([]);
  const [selectedDepartmentData, setSelectedDepartmentData] = useState([]);
  
  const selectedSex = watch('sex');
  const watchedBirthDate = watch('birthdate');
  const selectedDepartmentId = watch('department');
  const selectedSubDepartmentId = watch('subDepartment');

  // Control del modal de scraping
  const [showScraperModal, setShowScraperModal] = useState(createMode);
  const [scraperKey, setScraperKey] = useState(0);
  
  let isEmployeeActive = createMode ? true : (employee?.status ?? false);
  const disabledClasses = getDisabledClasses(viewMode, !isEmployeeActive);

  useEffect(() => {
    if (loadingEmployeeData) return;
    if (!employeeData.length) return;
    
    const newNumber = employee?.numEmployee ?? newNumEmployee(employeeData);
    setValue('numEmployee', newNumber);
  }, [employeeData, loadingEmployeeData]);
  
  // Calcular edad al cambiar birthdate
  useEffect(() => {
    calculateAge(watchedBirthDate, setValue);
  }, [watchedBirthDate, setValue]);

  useEffect(() => {
    const loadFormData = async () => {
      setLoadingData(true);
      try {
        const lockerAssignsData = await getLockerAssigns();
        setLockerAssigns(lockerAssignsData);
      } catch (error) {
        console.error("Error cargando dependencias del formulario", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, []);
  
  useEffect(() => {    
    const lockerAssignEmp = employee?.assign
      ? [...lockerAssigns, employee.assign]
      : [...lockerAssigns];
    setEmpLockerAssign(lockerAssignEmp);
  }, [lockerAssigns]);

  useEffect(() => {
    reset(employeeReset());
  }, [empLockerAssign, employeeData]);

  useEffect(() => {
    setValue('subDepartment', 0);
    setValue('position', '');
    setPositions([]);

    if (selectedDepartmentId) {  
      const selectedDepartment = filteredDepartments.find(d => d.id === Number(selectedDepartmentId));
      
      // Cargos por Departamento
      const positionsByDepartment = selectedDepartment?.positions.filter(
        pos => pos.subDepartment === null
      );

      setPositions(positionsByDepartment);
      setSubDepartments(selectedDepartment?.subDepartments ?? []);
      setSelectedDepartmentData(selectedDepartment);

    }
  }, [selectedDepartmentId, lockerAssigns]);

  useEffect(() => {
    if (!selectedDepartmentData?.positions) return;

    const positionsBySubDepartment = selectedDepartmentData.positions.filter(pos => {
      // Si hay un SubDepartamento seleccionado
      if (Number(selectedSubDepartmentId) > 0) {
        return pos.subDepartment?.id === Number(selectedSubDepartmentId);
      }
      
      // Si no hay selección busca los que no tienen subdepartamento
      return pos.subDepartment === null;
    });

    setPositions(positionsBySubDepartment);
  }, [selectedSubDepartmentId]);

  const onSubmit = async (data) => {
    let success = false;
    const submissionData = { id: employee?.id ?? null, ...data };

    if (editMode && employee) {
      success = await updateEmployee(submissionData);
    } else {
      success = await createEmployee(submissionData);
    }

    if (success) {
      navigate('/empleados');
    }
  };

  const onError = (formErrors) => {
    console.warn('EmployeeForm validation errors:', formErrors);
    if (!formErrors) return;

    // Define which fields belong to each tab (order matters)
    const tabFieldMap = {
      personal: [
        'numEmployee', 'firstName', 'secondName', 'lastName', 'secondLastName',
        'birthdate', 'placeOfBirth', 'nationality', 'age', 'sex', 'ci', 'maritalStatus',
        'bloodType', 'email', 'mobilePhoneCode', 'mobilePhone', 'homePhoneCode', 'homePhone', 'address', 'cityAddress'
      ],
      work: ['joinDate', 'department', 'subDepartment', 'position'],
      meruLink: ['userName', 'userPass', 'roleId', 'departmentCollectedIds'],
      contact: ['contacts'],
      bankInformation: ['bankInformation'],
      lockerAssign: ['lockerAssingId'],
    };

    // Helper to check if errors object has any key for given list
    const hasAnyError = (errs, keys) => {
      if (!errs) return false;
      for (const k of keys) {
        if (k === 'contacts' || k === 'bankInformation') {
          if (errs[k]) return true;
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(errs, k)) return true;
      }
      return false;
    };

    // Choose first tab (in order tabs[]) that has errors
    for (const t of tabs) {
      const keyList = tabFieldMap[t.id] || [];
      if (hasAnyError(formErrors, keyList)) {
        setActiveTab(t.id);
        return;
      }
    }

    setActiveTab('personal');
  };

  const employeeReset = () => {
    const defaultMobileCode = mobilePhoneCodes[0]?.code ?? '0414';
    const fullMobilePhone = employee?.mobilePhone || '';
    const { code: mobileCode, number: mobileNumber } = splitPhone(fullMobilePhone, true);

    const fullHomePhone = employee?.homePhone || '';
    const { code: homeCode, number: homeNumber } = splitPhone(fullHomePhone);
    const joinDate = employee?.joinDate ?? new Date().toISOString().split('T')[0];
    const birthdate = employee?.birthdate ? new Date(employee.birthdate).toISOString().split('T')[0] : null;

    const employeeDataForm = {
      ci: formatCI(employee?.ci) ?? '',
      firstName: employee?.firstName ?? '',
      secondName: employee?.secondName ?? '',
      lastName: employee?.lastName ?? '',
      secondLastName: employee?.secondLastName ?? '',
      birthdate: birthdate,
      placeOfBirth: employee?.placeOfBirth ?? '',
      nationality: employee?.nationality ?? 'V',
      sex: employee?.sex ?? '',
      maritalStatus: employee?.maritalStatus ?? 'Soltero',
      bloodType: employee?.bloodType ?? '',
      email: employee?.email ?? '',
      mobilePhoneCode: mobileCode || '0414',
      mobilePhone: mobileNumber ?? '',
      homePhoneCode: homeCode ?? '0286',
      homePhone: homeNumber ?? null,
      address: employee?.address ?? '',
      cityAddress: employee?.cityAddress ?? '',
      joinDate: joinDate ?? null,
      department: employee?.department?.id ?? '',
      subDepartment: employee?.subDepartment?.id ?? 0,
      position: employee?.position?.id ?? '',
      userName: employee?.userName ?? null,
      userPass: employee?.userPass ?? null,
      changePassNextLogin: !!employee?.changePassNextLogin,
      status: createMode ? true : !!employee?.status,
      useMeruLink: !!employee?.useMeruLink,
      roleId: employee?.roleSnapshot?.roleId ?? employee?.roleId ?? '',
      permissions: employee?.roleSnapshot?.permissions ?? [],
      departmentCollectedIds: (employee?.roleSnapshot?.departments ?? []).map(Number),
      useHidCard: !!employee?.useHidCard,
      useLocker: !!employee?.useLocker,
      useTransport: !!employee?.useTransport,
      contacts: (employee?.contacts ?? []).map((contact) => {
        const { code, number } = splitPhone(contact.phone, true);
        return {
          ...contact,
          phoneCode: code || defaultMobileCode,
          phone: number ?? '',
        };
      }),
      bankInformation: employee?.bankInformation?.length
        ? employee.bankInformation.map((bank) => {
            const { code, number } = splitPhone(bank.mobilePayNumber, true);
            return {
              ...bank,
              mobilePayCode: code || defaultMobileCode,
              mobilePayNumber: number ?? '',
            };
          })
        : [],
      lockerAssingId: employee?.assign?.id ?? '',
      padlockAssignPass: employee?.assign?.locker?.padlock?.pass ?? '',
      padlockAssignSerial: employee?.assign?.locker?.padlock?.serial ?? '',
      resetInstructions: employee?.assign?.locker?.padlock?.padlockPattern?.resetInstructions ?? '',
      unlockSequence: employee?.assign?.locker?.padlock?.padlockPattern?.unlockSequence ?? [],
    };
    if (createMode) return { ...employeeDataForm, age: '' };

    return employeeDataForm;
  };

  const handleScraperDataFound = (data) => {
    
    if (data.first_name) setValue('firstName', data.first_name);
    if (data.second_name) setValue('secondName', data.second_name);
    if (data.last_name) setValue('lastName', data.last_name);
    if (data.second_last_name) setValue('secondLastName', data.second_last_name);
    if (data.ci) setValue('ci', formatCI(data.ci.replace("V-", "")));
    if (data.birthdate) {
      const [d, m, y] = data.birthdate.split('/');
      setValue('birthdate', `${y}-${m}-${d}`);
    }
    if (data.nationality) setValue('nationality', data.nationality);
    if (data.sex) {
      if (data.sex === 'Femenino') setValue('sex', 'M');
      else if (data.sex === 'Masculino') setValue('sex', 'H');
    }
    setShowScraperModal(false);
  };

  const handleScraperSkip = () => setShowScraperModal(false);

  return (
    <div className="w-full mx-auto overflow-x-auto p-2 rounded-lg">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="aling-items-right">
            {(isEmployeeActive && viewMode) && (  
              <HasPermission permissions={["edit-employees"]}> 
                <HeadFormButtons url={`/empleados/editar/${employee?.id}`} data={[]} />
              </HasPermission> 
            )}{/*TODO: todas las rutas funcionen sin data  */}
          </div>

          <div className="table-container rounded-lg mt-4 shadow-md p-6 w-full overflow-auto">
            <div className="md:justify-center flex gap-x-34 items-center gap-6 relative pb-6 flex-wrap">
              <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-start mb-2 md:mb-0">
                <div className="w-30 h-30 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center md:ml-2.5">
                  <User className="w-20 h-20 text-white" />
                </div>
              </div>
              <div className='w-full md:w-auto justify-center md:justify-start'>
                <TitleHeader 
                  title={editMode ? ('Editar Empleado') : (viewMode ? 'Datos del Empleado' : 'Registrar Empleado')} 
                  dynamicClasses="mb-6! md:mb-4! text-center md:text-left" 
                />
                <HeaderEmployeeForm register={register} errors={errors} viewMode={viewMode} disabledClasses={disabledClasses} />
              </div>
            </div>

            <EmployeeTopBar 
              createMode={createMode} 
              editMode={editMode} 
              viewMode={viewMode} 
              setShowScraperModal={setShowScraperModal} 
              setScraperKey={setScraperKey} 
              employee={employee} 
              loadingChangeStatus={loadingChangeStatus} 
            />
          
            <TabButtonsManager 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              errors={errors}
            />

            <div className="mt-6">
              <ActiveTab
                activeTab={activeTab}
                mode={mode}
                createMode={createMode}
                viewMode={viewMode}
                isEmployeeActive={isEmployeeActive}
                disabledClasses={disabledClasses}
                employee={employee}
                departments={filteredDepartments}
                loadingData={loadingData}
                selectedDepartmentId={selectedDepartmentId}
                subDepartments={subDepartments}
                positions={positions}
                empLockerAssign={empLockerAssign}
                selectedSex={selectedSex}
              />
            </div>
          </div>

          <FooterFormButtons isSubmitting={isSubmitting} mode={mode} navigate={navigate} permissions={["create-employees", "edit-employees"]} />
        </form>
      </FormProvider>

      {createMode && (
        <EmployeeScraperModal
          key={scraperKey}
          isOpen={showScraperModal}
          onDataFound={handleScraperDataFound}
          onSkip={handleScraperSkip}
        />
      )}
    </div>
  );
}