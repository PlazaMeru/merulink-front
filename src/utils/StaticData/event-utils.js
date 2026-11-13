export const fixedEvents = [
  '01-01', '05-01', '06-24', '07-05', '07-24', '10-12', '12-24', '12-25', '12-31'
];

export const STATUS_EVENTS = {
  created:   'Creado',
  tentative: 'Tentativo',
  confirmed: 'Confirmado',
  finalized: 'Finalizado'
}

export const recurrenceOptions = [
  {
    id: 1,
    label: 'Anual',
    value: 'YEARLY',
  },
  {
    id: 2,
    label: 'Mensual',
    value: 'MONTHLY',
  },
  {
    id: 3,
    label: 'Quincenal',
    value: 'WEEKLY_2',
  },
  {
    id: 4,
    label: 'Semanal',
    value: 'WEEKLY',
  },
  {
    id: 5,
    label: 'Rotativo',
    value: 'ROTATIVE',
  },
];