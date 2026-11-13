import * as yup from 'yup';

// Validation schema for Employee form
// @param {Object} options - Options object
// @param {boolean} options.isEditMode - Whether the form is in edit mode
export const employeeValidationSchema = (options = {}) => {
  const { isEditMode = false } = options;

  return yup.object().shape({
    numEmployee: yup
      .string()
      .required('No. Empleado es requerido')
      .matches(/^[0-9]+$/, 'Solo se permiten números.')
      .min(3, 'Mínimo 3 caracteres')
      .max(12, 'Máximo 12 caracteres'), 
      
    ci: yup
      .string()
      .required('Cédula es requerida')
      .transform((value) => (value || '').replace(/\./g, ''))
      .matches(/^[0-9]+$/, 'Solo se permiten números.')
      .min(7, 'Debe contener entre 7 y 8 dígitos')
      .max(8, 'Debe contener entre 7 y 8 dígitos'), 
      
    firstName: yup
      .string()
      .required('Primer nombre es requerido')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras.'),
      
    secondName: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'Solo se permiten letras.')
      .optional(),
      
    lastName: yup
      .string()
      .required('Primer apellido es requerido')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras.'),
      
    secondLastName: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'Solo se permiten letras.')
      .optional(),
      
    birthdate: yup
      .date()
      .optional()
      .nullable()
      .max(new Date(), 'La fecha de nacimiento no puede ser futura'),
      // .test(
      //   'is-adult',
      //   'Debe ser mayor de 18 años',
      //   (value) => {
      //     if (!value) return true;
      //     const today = new Date();
      //     const birth = new Date(value);
          
      //     const eighteenYearsAgo = new Date(
      //       birth.getFullYear() + 18,
      //       birth.getMonth(),
      //       birth.getDate()
      //     );
      //     return today >= eighteenYearsAgo;
      //   }
      // )

    placeOfBirth: yup.string()
      .when('nationality', {
        is: (value) => value === 'V',
        then: (schema) => schema.required('Lugar de nacimiento es requerido'),
        otherwise: (schema) => schema.notRequired(),
      }),
    nationality: yup.string().required('Nacionalidad es requerida'),
    
    age: yup.string().matches(/^[0-9]*$/, 'Solo se permiten números.'), 
    sex: yup.string().required('Sexo es requerido'),
  
    maritalStatus: yup.string(),
    bloodType: yup.string().nullable(),
    
    email: yup.string().email('Email inválido'),
    
    mobilePhoneCode: yup.string(),
    mobilePhone: yup
      .string()
      .nullable()
      .required('Teléfono móvil es requerido')
      .matches(/^[0-9]{3}-[0-9]{4}$/, 'Formato inválido. Debe ser 000-0000')
      .min(8, 'Debe contener el formato completo (ej: 000-0000)')
      .max(8, 'Debe contener el formato completo (ej: 000-0000)'),

    homePhoneCode: yup.string(),
    homePhone: yup
      .string()
      .nullable()
      .matches(/^[0-9]+$/, 'Solo se permiten números.')
      .max(8, 'Máximo 8 dígitos')
      .optional(),
      
    address: yup.string(),
    cityAddress: yup.string(),
    joinDate: yup.string().required('Fecha de ingreso es requerida'),
    department: yup.string().required('Departamento es requerido'),
    subDepartment: yup.string(),
    position: yup.string().required('Cargo es requerido'),
    userName: yup
      .string()
      .nullable()
      .optional()
      .when('useMeruLink', {
        is: true,
        then: (schema) => 
          schema
            .required('Nombre de usuario es requerido.')
            .min(4, 'Mínimo 4 caracteres'),

        otherwise: (schema) => 
          schema.notRequired().nullable()
          
      }),
    userPass: yup
      .string()
      .nullable()
      .optional()
      .when('useMeruLink', {
        is: true,
        then: (schema) => {
          if (isEditMode) {
            return schema.notRequired().nullable();
          }
          return schema
            .required('Contraseña es requerida.')
            .min(7, 'Mínimo 7 caracteres entre números y letras')
            .max(20, 'Máximo 20 caracteres entre números y letras');
        },
        otherwise: (schema) => 
          schema.notRequired().nullable()
        
      }),
    roleId: yup
      .string()
      .nullable()
      .optional()
      .when('useMeruLink', {
        is: true,
        then: (schema) => {
          return schema
            .required('Rol de usuario es requerido.');
        },
        otherwise: (schema) => 
          schema.notRequired().nullable()
        
      }),
    departmentCollectedIds: yup
      .array()
      .when('useMeruLink', {
        is: true,
        then: (schema) =>
          schema
            .required('Debe seleccionar al menos un departamento para MeruLink')
            .min(1, 'Debe seleccionar al menos un departamento para MeruLink'),
        otherwise: (schema) => schema.notRequired(),
      }),
    status: yup.boolean(),
    useMeruLink: yup.boolean(),
    useHidCard: yup.boolean(),
    useLocker: yup.boolean(),
    lockerAssingId: yup
      .string()
      .nullable()
      .optional()
      .when('useLocker', {
        is: true,
        then: (schema) => 
          schema
            .required('Debe seleccionar Locker.'),
        otherwise: (schema) => 
          schema.notRequired().nullable() 
      }),
    useTransport: yup.boolean(),
    
    // Validación de contactos
    contacts: yup.array().of(
      yup.object().shape({
        id: yup.number(),

        name: yup
          .string()
          .required('Nombre del contacto es requerido')
          .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras.'),
          
        lastName: yup
          .string()
          .required('Apellido del contacto es requerido')
          .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras.'),
          
        relationship: yup.string().required('Parentesco es requerido'),
        
        phoneCode: yup.string().required('Código telefónico es requerido'),

        phone: yup
          .string()
          .required('Teléfono es requerido')
          .matches(/^[0-9]{3}-[0-9]{4}$/, 'Formato inválido. Debe ser 000-0000'),
          
        address: yup.string().required('Dirección es requerida'),
      })
    ),

    // Validación de datos bancarios
    bankInformation: yup.array().of(
      yup.object().shape({
        id: yup.number(),

        bankName: yup
          .string()
          .required('Nombre del banco es requerido')
          .max(50, 'Máximo 50 caracteres'),

        accountNumber: yup
          .string()
          .required('Número de cuenta es requerido')
          .matches(/^[0-9]+$/, 'Solo se permiten números.')
          .max(20, 'Máximo 20 dígitos'),

        mobilePayNumber: yup
          .string()
          .nullable()
          .optional()
          .test(
            'mobile-pay-number-format',
            'Formato inválido. Debe ser 000-0000',
            (number) => !number || /^[0-9]{3}-[0-9]{4}$/.test(number)
          ),

        mobilePayCode: yup.string().when('mobilePayNumber', {
          is: (number) => !!number,
          then: (schema) => schema.required('Código telefónico es requerido'),
          otherwise: (schema) => schema.notRequired(),
        }),
      })
    ),
  });
};