import * as yup from 'yup';

export const locationValidationSchema = yup.object({
  area: yup
    .string()
    .required('La Zona / Área es obligatoria.')
    .max(100, 'La Zona / Área no debe superar los 100 caracteres.'),
  floor: yup
    .string()
    .required('El Nivel / Planta es obligatorio.')
    .max(50, 'El Nivel / Planta no debe superar los 50 caracteres.'),
  reference_point: yup
    .string()
    .nullable()
    .max(255, 'El Punto de referencia no debe superar los 255 caracteres.'),
});
