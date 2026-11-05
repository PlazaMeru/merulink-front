export const mapLocationToBackend = (formData) => ({
  area: formData.area,
  floor: formData.floor,
  reference_point: formData.referencePoint || '',
});