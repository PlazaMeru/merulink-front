import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { getDisabledClasses } from '../../utils/global-utils';
import { recurrenceOptions } from '../../utils/StaticData/event-utils.js';

import ErrorMessage from '../Shared/ErrorMessage.jsx';
import InfoToggleSeccion from '../Shared/InfoToggleSecction.jsx';
import LabelFieldForm from '../Shared/LabelFieldForm';
import TitleHeader from '../Shared/TitleHeader';
import ToggleStatus from '../Shared/ToggleStatus.jsx';
import ToggleIsRepeatActive from '../Shared/ToggleIsRepeatActive.jsx';
import RichTextEditor from '../Shared/RichTextEditor';
import OptionSelect from '../Shared/OptionSelect';

export default function EventFormContent({ 
  register, 
  control,
  errors,
  isTemplate, 
  viewMode, 
  editMode,
  config,
  meruEventsFlag,
  eventOneDayWithEndTime,
  isRepeatEvent,
  isGoogleCategory,
  createdBy,
  guestNextDate,
  handleNextTime,
  setValue,
  disabledClasses,
  globalLoading,
  locations,
  templateInfo,
  watch,
  setActiveTab,
  parentEventId,
  isMeruBirthDay
}) {

  const yearlyEvent = config?.isYearly;
  const repeatEventDisabledClasses = getDisabledClasses(yearlyEvent, !isRepeatEvent);
  const watchRepeatAlways = watch('repeatAlways');
  const disableRepeatUntil = getDisabledClasses(watchRepeatAlways);
  // const hasParentEvent = parentEventId ?? true;

  useEffect(() => {
    setValue('repeatUntil', null, { shouldValidate: true });
  }, [watchRepeatAlways])
  
  const renderRepeatInterval = () => {
    return recurrenceOptions
            .filter(option => {
              if (option.value === 'ROTATIVE') {
                return isGoogleCategory; // solo se incluye si la categoría seleccionada es Google Calendar
              }
              return true;
            })
            .map(recurrenceOption => (
              <OptionSelect key={`repeatInterval-${recurrenceOption.id}`} value={recurrenceOption.value} text={recurrenceOption.label} />
    ));
  };

  const checkRepeatFields = (e) => {
    const isChecked = e.target.checked;

    setValue('repeatUntil', null, { shouldValidate: true });
    setValue('repeatAlways', false, { shouldValidate: true });
    setValue('isRepeatActive', isChecked, { shouldValidate: true });
  };

  return (
    <>
      <TitleHeader title={editMode ? ( 'Editar Evento' ):( 'Datos Evento')} /> 

      <InfoToggleSeccion
        isRegisteredTemplate={isTemplate}
        createdBy={createdBy}
        showTemplateToggle={!isGoogleCategory}
        readOnly={viewMode}
        register={register}
        errors={errors}
        setValue={setValue}
        templateInfo={templateInfo}
      />
      <div className='div-border'>
        <div className='flex flex-col md:flex-row justify-center gap-2 md:gap-4 mb-4'>

          <LabelFieldForm field="Nombre" simbol="*" />
          <div className="w-full max-w-2xl">
            <input 
              readOnly={viewMode}
              {...register('eventName')} 
              type='text' 
              className={`w-full px-3 py-2 rounded-lg filter-input border ${disabledClasses}`} 
            />
            {errors?.eventName && <ErrorMessage msg={errors.eventName.message} /> }  
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full div-border">                    

          <LabelFieldForm field={`Fecha ${(meruEventsFlag && !eventOneDayWithEndTime) ? 'Inicio' : ''}`} simbol="*" />
          <div>
            <input 
              readOnly={viewMode} type='date'
              {...register('startDate', {onChange: (e) => guestNextDate(e) })}
              className={`w-full px-3 py-2 rounded-lg filter-input  ${disabledClasses}`} 
            />
            {errors?.startDate && <ErrorMessage msg={errors.startDate.message} /> }  
          </div>

          {config?.hasEndDate && ( 
            <>
              <LabelFieldForm field="Fecha Fin" simbol="*" />
              <div>
                <input 
                  readOnly={viewMode} type='date'
                  {...register('endDate')}
                  className={`w-full px-3 py-2 rounded-lg filter-input ${disabledClasses}`}  
                />
                {errors?.endDate && <ErrorMessage msg={errors.endDate.message} />}  
              </div> 
            </>
          )}

          {config?.hasStartTime && (
            <>
              <LabelFieldForm field="Hora Inicio" simbol="*" />
              <div>
                <input 
                  readOnly={viewMode} type='time'
                  {...register('startTime', { onChange: (e) => { handleNextTime(e)} })} 
                  className={`w-full px-3 py-2 rounded-lg filter-input ${disabledClasses}`}
                />
                {errors?.startTime && <ErrorMessage msg={errors.startTime.message} /> }
              </div>
            </>
          )}

          {config?.hasEndTime && (
            <>
              <LabelFieldForm field="Hora Fin" simbol="*" />
              <div>
                <input 
                  readOnly={viewMode} type='time'
                  {...register('endTime')} 
                  className={`w-full px-3 py-2 rounded-lg filter-input ${disabledClasses}`}
                />
                {errors?.endTime && <ErrorMessage msg={errors.endTime.message} /> }
              </div> 
            </>
          )}

          {config?.hasStatus && (
            <>
              <LabelFieldForm field="Estado" simbol="*" />
              <div className='items-center gap-2 min-h-15'>
                <ToggleStatus   
                  readOnly={viewMode}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  dynamicClasses={disabledClasses}
                />

                {config?.hasEventContact && (
                  <Link onClick={() => setActiveTab('eventContact')} className="text-gray-300! text-xs hover:text-[#9fd8ff]! transition-colors duration-300">
                    Agregar datos del cliente
                  </Link>
                )}
                
                {errors?.status && <ErrorMessage msg={errors.status.message} /> }  
              </div>
            </> 
          )}

          {config?.hasLocation && (
            <>
            <LabelFieldForm field="Ubicación" simbol="*" />
            <div>
              <select 
                disabled= {viewMode}
                {...register('locationId')}
                className={`text-xl w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}
              >    
                  <option className="bg-[#3c4042]" value=""> {globalLoading ? "Cargando..." : "Seleccionar..."} </option>
                  {locations.map(location => (
                    <option key={`location-${location.id}`} className='bg-[#3c4042]' value={location.id}>{location.area}</option>
                  ))}
              </select>
              {errors?.locationId && <ErrorMessage msg={errors.locationId.message} /> }  
            </div> 
            </> 
          )}

          {config?.hasRepeatEvent && (
            <>
              <LabelFieldForm field="Se repite" />
              <div className='items-center gap-2 min-h-15 bg-[#ffffff21] rounded-lg p-1'>
                <div className='flex flex-row items-center gap-2 ml-2'>
                  <input 
                    disabled={viewMode || yearlyEvent} onClick={(e) => checkRepeatFields(e)}
                    {...register('repeatEvent')}  type='checkbox' className={`w-6 h-6 rounded filter-input ${disabledClasses} `}  
                  />
                  <div>
                    <select 
                      disabled= {viewMode || !isRepeatEvent || yearlyEvent}
                      {...register('repeatInterval')}
                      className={`text-xl w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses} ${repeatEventDisabledClasses}`}
                    >
                      <OptionSelect text="Seleccionar..." />
                      {renderRepeatInterval()}
                    </select>
                    {errors?.repeatInterval && <ErrorMessage msg={errors.repeatInterval.message} /> }  
                  </div>
                  
                </div>
                {((isRepeatEvent || parentEventId) && !isMeruBirthDay) && ( 
                  <>
                  <div className='pb-1 w-full  bg-field rounded-xl'>
                    <div className='flex flex-row p-2 mt-2 gap-4 justify-center'>
                      <div className=''>
                        <span> Hasta: </span>
                        <input 
                          readOnly={viewMode || watchRepeatAlways } type='date'
                          {...register('repeatUntil')}
                          className={`w-40 px-3 py-2 rounded-lg filter-input ${disabledClasses} ${disableRepeatUntil}`}  
                        />
                        {errors?.repeatUntil && <ErrorMessage msg={errors.repeatUntil.message} />}  
                      </div> 
                    </div>
                
                    <div className='flex items-center mb-2 justify-center'>
                      <span className='text-gray-300! text-xs ml-4'> Repetir Siempre: </span>
                      <input 
                        readOnly={viewMode} type='checkbox'
                        {...register('repeatAlways')}
                        className={`ml-2 w-4 h-4 rounded filter-input ${disabledClasses}`}  
                      />
                    </div>
                  </div>
                
                  <ToggleIsRepeatActive   
                    readOnly={viewMode}
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                    dynamicClasses={disabledClasses}
                  />
                </>
                )}
              </div>
            </>
          )}

        
          {config?.hasCreateAlert  && (
            <>
            <LabelFieldForm field="Crear Alerta" />
            <div className='flex flex-row items-center gap-2'>
              <input 
                disabled={viewMode}  type='checkbox'  
                {...register('createAlert')} className={`w-6 h-6 rounded filter-input text-gray-300 ${disabledClasses}`}
              />
              {errors?.createAlert && <ErrorMessage msg={errors.createAlert.message} /> }  
            </div>
            </>
          )}

          {config?.hasColorinDay  && (
            <>
            <LabelFieldForm field="Resaltar Día" />
            <div className='flex flex-row items-center gap-2'>
              <input 
                disabled={viewMode}  type='checkbox'
                {...register('coloringDay')} className={`w-6 h-6 rounded filter-input text-gray-300 ${disabledClasses}`}
              />
              {errors?.coloringDay && <ErrorMessage msg={errors.coloringDay.message} /> }  
            </div>
            </>
          )}
        </div>
        
        <div className='flex flex-col md:flex-row justify-center gap-2 md:gap-4 mb-4 mt-6 div-border'>
          {config?.hasDescription  && (
            <>
            <LabelFieldForm field="Descripción" />
            <div className="w-full max-w-2xl">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor 
                    key={viewMode ? 'readonly' : 'editable'}
                    readonly={viewMode}
                    value={field.value} 
                    onChange={field.onChange} 
                    placeholder="Ingrese detalles adicionales..."
                  />
                )}
              />
              {errors?.description && <ErrorMessage msg={errors.description.message} /> }  
            </div>
            </>
          )}

          {config?.hasComments && (
            <>
            <LabelFieldForm field="Comentarios" />
            <div className="w-full max-w-2xl">
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <RichTextEditor 
                    key={viewMode ? 'readonly' : 'editable'}
                    readonly={viewMode}
                    value={field.value} 
                    onChange={field.onChange} 
                    placeholder="Ingrese comentarios adicionales..."
                  />
                )}
              />
              {errors?.comments && <ErrorMessage msg={errors.comments.message} /> }  
            </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
