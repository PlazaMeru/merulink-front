import { useFormContext } from 'react-hook-form';
import { useEmployees } from '../../../context/EmployeeContext';

import { ciOption } from "../../../utils/text-utils";
import { phoneCodes, mobilePhoneCodes } from "../../../utils/StaticData/phoneCodes-utils"; 
import { findVenezuelaState } from "../../../utils/StaticData/venezuelaStates-utils";

import LabelFieldForm from "../../Shared/LabelFieldForm";
import ErrorMessage from "../../Shared/ErrorMessage";
import InputEmail from "../../Shared/InputEmail";
import PhoneNumber from "../../Shared/PhoneNumber";
import PlaceOfBirthField from "../../Shared/PlaceOfBirthField";
import SpanText from "../../Shared/SpanText";

export default function PersonalData({ createMode, viewMode, isEmployeeActive, employee, disabledClasses }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { loadingFieldChange, toggleEmployeeField } = useEmployees();

  //  - Venezolano: preselecciona un estado si el texto coincide, si no limpia.
  //  - Extranjero: limpia placeOfBirth.
  const nationalityField = register('nationality');
  const handleNationalityChange = (e) => {
    const prevNationality = watch('nationality');
    nationalityField.onChange(e); // react-hook-form actualiza 'nationality'
    const newNationality = e.target.value;

    if (viewMode || prevNationality === newNationality) return;

    if (newNationality === 'V') {
      const currentPlace = watch('placeOfBirth') || '';
      const matched = findVenezuelaState(currentPlace);
      setValue('placeOfBirth', matched ? matched.name : '', { shouldDirty: true, shouldValidate: true });
    } else {
      setValue('placeOfBirth', '', { shouldDirty: true, shouldValidate: true });
    }
  };

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 w-full">

        <div>
          <LabelFieldForm field="Fecha de Nacimiento" />
            <input 
              readOnly={viewMode} type="date" {...register('birthdate')} 
              className={`w-full px-3 py-2 rounded-lg filter-input bg-gray-700 text-gray-300 ${disabledClasses}`} 
            />
          {errors.birthdate && <ErrorMessage msg={errors.birthdate.message} /> }
        </div>
        <div className="w-full">
          <LabelFieldForm field="Lugar de Nacimiento" />
          <PlaceOfBirthField viewMode={viewMode} disabledClasses={disabledClasses} />
        </div>

        <div>
          <LabelFieldForm field="Nacionalidad" simbol="*" />
            <select 
              disabled= {viewMode} 
              {...nationalityField} onChange={handleNationalityChange}
              className={`w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}
            >
              <option className='bg-[#3c4042]' value="">Seleccionar...</option>
              <option className='bg-[#3c4042]' value="V">Venezolano/a</option>
              <option className='bg-[#3c4042]' value="E">Extranjero/a</option>
            </select>
          {errors?.nationality && <ErrorMessage msg={errors.nationality.message} />}
        </div>

        <div>
          <LabelFieldForm field="Cédula" simbol="*"/>
             <input readOnly={viewMode} {...register('ci', ciOption)} className={`w-full px-3 py-2 rounded-lg filter-input ${disabledClasses}`} />
          {errors?.ci && <ErrorMessage msg={errors.ci.message} />}
        </div>

        <div>
          <LabelFieldForm field="Edad" simbol="*"/>
             <input readOnly={true} {...register('age')} className={`w-full px-3 py-2 rounded-lg filter-input cursor-not-allowed ${disabledClasses}`} disabled/>
          {errors?.age && <ErrorMessage msg={errors.age.message} />}
        </div>
        
        <div>
          <LabelFieldForm field="Sexo" simbol="*"/>
            <select 
              disabled= {viewMode}
              {...register('sex')} 
              className={`w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}>
              <option className='bg-[#3c4042]' value="">Seleccionar...</option>
              <option className='bg-[#3c4042]' value="H">Masculino</option>
              <option className='bg-[#3c4042]' value="M">Femenino</option>
          </select>
          {errors?.sex && <ErrorMessage msg={errors.sex.message} />}
        </div>

        <div>
           <LabelFieldForm field="Estado Civil" />
            <select 
              disabled= {viewMode}
              {...register('maritalStatus')} 
              className={`w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}>
              <option className='bg-[#3c4042]' value="">Seleccionar...</option>
              <option className='bg-[#3c4042]' value="Soltero">Soltero/a</option>
              <option className='bg-[#3c4042]' value="Casado">Casado/a</option>
              <option className='bg-[#3c4042]' value="Divorciado">Divorciado/a</option>
              <option className='bg-[#3c4042]' value="Viudo">Viudo/a</option>
              <option className='bg-[#3c4042]' value="UnionLibre">Unión Libre / Concubinato</option>
              <option className='bg-[#3c4042]' value="Separado">Separado/a</option>
            </select>
          {errors?.maritalStatus && <ErrorMessage msg={errors.maritalStatus.message} />}
        </div>

        <div>
           <LabelFieldForm field="Tipo de Sangre" />
           <select 
            disabled= {viewMode}
            {...register('bloodType')} 
            className={`w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}>
                <option className='bg-[#3c4042]' value="">Seleccionar...</option> 
                <option className='bg-[#3c4042]' value="A+">A+</option>
                <option className='bg-[#3c4042]' value="A-">A-</option>
                <option className='bg-[#3c4042]' value="B+">B+</option>
                <option className='bg-[#3c4042]' value="B-">B-</option>
                <option className='bg-[#3c4042]' value="AB+">AB+</option>
                <option className='bg-[#3c4042]' value="AB-">AB-</option>
                <option className='bg-[#3c4042]' value="O+">O+</option>
                <option className='bg-[#3c4042]' value="O-">O-</option>
              </select>
          {errors?.bloodType && <ErrorMessage msg={errors.bloodType.message} />}
        </div>

        <div>
          <LabelFieldForm field="Teléfono Móvil" simbol="*"/>
            <PhoneNumber 
              type="mobilePhone" 
              disabled={viewMode} 
              register={register} 
              dynamicClasses={disabledClasses} 
              arrayCodes={mobilePhoneCodes}
              setValue={setValue}
            />
          {errors?.mobilePhone && <ErrorMessage msg={errors.mobilePhone.message} />}
        </div>

        <div>
          <LabelFieldForm field="Teléfono Habitación"/>
            <PhoneNumber 
              type="homePhone" 
              disabled={viewMode} 
              register={register} 
              dynamicClasses={disabledClasses} 
              arrayCodes={phoneCodes}
              setValue={setValue}
            />
          {errors?.homePhone && <ErrorMessage msg={errors.homePhone.message} />}
        </div>

        <div className="">
          <LabelFieldForm field="Correo Electrónico" />
            <InputEmail readOnly={viewMode} register={register} disabledClasses={disabledClasses} />
          {errors?.email && <ErrorMessage msg={errors.email.message} />}
        </div>

        <div className="md:col-span-1 lg:col-span-2">
          <LabelFieldForm field="Dirección" />
           <input readOnly={viewMode} {...register('address')} className={`w-full px-3 py-2 rounded-lg filter-input ${disabledClasses}`} />
          {errors?.address && <ErrorMessage msg={errors.address.message} />}
        </div>
        <div>
          <LabelFieldForm field="Ciudad" />
           <select 
            disabled= {viewMode}
            {...register('cityAddress')} 
            className={`w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}>
              <option className='bg-[#3c4042]' value="">Seleccionar...</option> 
              <option className='bg-[#3c4042]' value="puerto_ordaz">Puerto Ordaz</option>
              <option className='bg-[#3c4042]' value="san_felix">San Felix</option>
            </select>
          {errors?.cityAddress && <ErrorMessage msg={errors.cityAddress.message} />}
        </div>

        <div className='flex flex-row'>

          <div className="flex items-center gap-4 pl-4">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <span className="text-sm">¿Usa Transporte?</span>
                {loadingFieldChange.loading && loadingFieldChange.field === 'use_transport' ? (
                  <SpanText />
                ) : (
                  <input 
                    disabled={!isEmployeeActive }
                    type="checkbox" {...register('useTransport')} className={`w-4 h-4 rounded ${!isEmployeeActive && disabledClasses}`} 
                    onClick={() => !createMode && toggleEmployeeField(employee, "use_transport")} 
                  />
                )}
            </label>
          </div>
        </div>
      </div>
    );
   
   
}
