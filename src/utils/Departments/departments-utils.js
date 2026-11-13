// Generar número de departamento automáticamente
export const maxNum = (departmentData) => Math.max( 0,
  ...departmentData.map(d => {
    const num = parseInt(d.code) || 0;
    return num;
  })
);