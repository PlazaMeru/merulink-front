import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';

import { truncateText } from '../../utils/text-utils';
import { STATUS_EVENTS } from '../../utils/StaticData/event-utils';
import { divideDateTime, normalizeDateToString, formatTimeTo12H } from '../../utils/date-utils';

import ButtonDelete from '../Shared/ButtonDelete';
import ButtonIsTemplate from '../Shared/ButtonIsTemplate';
import ConfirmDialog from '../Shared/ConfirmDialog';
import SpanText from "../Shared/SpanText";

export default function EventRow( {event, isMeruBirthday, eventWithLocation, isEventWithStatus, isGoogleEvent} ) {
  const { deleteEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const divideDateTimeStart = divideDateTime(event?.start);
  const status = event?.extendedProps?.status ?? null;
  const isConfirmedEvent = status === STATUS_EVENTS.confirmed;
  const isNotExternalEvent = !event.extendedProps?.externalDate;
  const blockBtn = isConfirmedEvent  ? true : false;
  const deleteBtnTitle = blockBtn ? 'No se puede eliminar evento con Estatus Confirmado' : 'Eliminar';
  const eventCategoryLabel = event?.extendedProps?.specialLabel ? event?.extendedProps?.specialLabel : event?.extendedProps?.category?.label;
  const eventIsToday = event?.start.split('T')[0] === new Date().toISOString().split('T')[0];

  const renderDescriptionComments = () => {
    const description = event.extendedProps?.description ? event.extendedProps?.description : '';
    const comments = event.extendedProps?.comments ? event.extendedProps?.comments : '';

    return event.extendedProps?.description ? truncateText(description, 50) : truncateText(comments, 50);
  }

  const handleDeleteEvent = (event) => {
    deleteEvent(event);
  }

  const selectedEvent = (id) => {
    navigate(`/eventos/ver/${id}`); 
  };

  return (
    <>
      <tr
        key={event.id}
        onClick={() => selectedEvent(event.id)}
        title={eventIsToday ? "¡Este evento es Hoy!" : ''}
        className={`border-b tr-table hover:bg-blue-50 transition-colors duration-150 ${eventIsToday && '!border !border-red-500 hover:!border-3'}`}
      >
        <td className="px-4 py-3 text-white-800 font-medium">{event.title}</td>
        <td className="px-4 py-3 text-white-800 font-medium ">{normalizeDateToString(event?.start)}</td>
        
        {isMeruBirthday ? (
          <>
            <td className="px-4 py-3 text-white-700">{event.extendedProps?.department?.name}</td>
            <td className="px-4 py-3 text-white-700">{event.extendedProps?.nextAge} Años</td>
          </>
        ) : ( 
          <>
            {!isGoogleEvent && <td className="px-4 py-3 text-white-800 font-medium ">{formatTimeTo12H(divideDateTimeStart?.time)}</td>}
            <td className="px-4 py-3 text-white-700" dangerouslySetInnerHTML={{ __html: renderDescriptionComments() }}></td>
          </>
        )}

        {eventWithLocation && (
          <td className="px-4 py-3 text-white-700">{event.extendedProps?.location?.area}</td>
        )}
        <td className="px-4 py-3 text-white-700">{eventCategoryLabel}</td>
        
        {isEventWithStatus && <td className="px-4 py-3 text-white-700">{event.extendedProps?.status}</td> }

        {(!isMeruBirthday && isNotExternalEvent ) ? (
          <td className="px-4 py-3">
            <ButtonDelete 
              setIsModalOpen={setIsModalOpen}
              title={deleteBtnTitle}
              dynamicClasses={blockBtn && 'cursor-not-allowed opacity-50'}
              disabled={blockBtn} 
              id={event.id} 
            />
          </td>
        ) : (
          !isMeruBirthday && (
            <td className="mt-5">
              <SpanText text="Sin Acciones" />
            </td>
          )
        )}

        {event.extendedProps?.isTemplate && <ButtonIsTemplate/> }
      </tr>
      <tr>
        <td>
          <ConfirmDialog 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => handleDeleteEvent(event)}
            title="Eliminar Evento"
            message={`¿Está seguro de que desea eliminar "${event.title}"?`}
          />
        </td>
      </tr>
    </>
  );
}