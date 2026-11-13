import { useFormContext, useFieldArray } from 'react-hook-form';
import { getDisabledClasses } from '../../../utils/global-utils';  
import ButtonAddContact from '../../Shared/ButtonAddContact';
import ButtonTrash from '../../Shared/ButtonTrash';
import { allBanks } from '../../../utils/StaticData/bank-information-utils';

export default function BankInformation({ viewMode }) {

  const { register, control, formState: { errors } } = useFormContext();
  const { fields = [], append, remove } = useFieldArray({ control, name: 'bankInformation' });

  const disabledClasses = getDisabledClasses(viewMode);
  
  const addBankInformation = fields.length < 2 ? true : false;

  const handleAddBankInformation = () => {
    if (typeof append === 'function' && addBankInformation) {
      append({
        id: Date.now(),
        bankName: '',
        accountNumber: '',
        mobilePayNumber: ''
      });
    }
  };

    return (
      <div className="p-4 rounded border border-[#ffffff21]">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-300">Agregar datos de pago bancarios (Máximo 5)</p>
          <ButtonAddContact
            disabled={viewMode}
            handleAddContact={handleAddBankInformation}
            addContacts={addBankInformation}
            text="Agregar Datos Bancarios"
            dynamicClasses={disabledClasses}
          />
        </div>

        {fields.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No hay datos bancarios agregados. Haz click en "Agregar Dato Bancario" para añadir uno.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded overflow-hidden">
              <thead>
                <tr className="tr-thead-table">
                  <th className="p-2 text-left">Banco</th>
                  <th className="p-2 text-left">Número de Cuenta</th>
                  <th className="p-2 text-left">Pago Móvil</th>
                  <th className="p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="tr-table">
                    <td className="p-2">
                      {/* <input
                        readOnly={viewMode}
                        {...register(`bankInformation.${index}.bankName`)}
                        placeholder="Banco"
                        maxLength={50}
                        className={`input-dark text-sm ${disabledClasses}`}
                      /> */}
                      <select 
                        disabled={viewMode} 
                        {...register(`bankInformation.${index}.bankName`)}
                        className={`w-full px-3 py-2 rounded-lg filter-input text-gray-300 ${disabledClasses}`}
                      >
                        <option className="bg-[#3c4042]" value=""> Seleccionar... </option>
                        {allBanks?.map((item) => ( 
                          <option key={item.value} value={item.value} className='bg-[#3c4042]'>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      {errors?.bankInformation?.[index]?.bankName && (
                        <p className="text-red-400 text-xs mt-1">{errors.bankInformation[index].bankName.message}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        readOnly={viewMode}
                        {...register(`bankInformation.${index}.accountNumber`)}
                        placeholder="Número de cuenta"
                        maxLength={20}
                        className={`input-dark text-sm ${disabledClasses}`}
                      />
                      {errors?.bankInformation?.[index]?.accountNumber && (
                        <p className="text-red-400 text-xs mt-1">{errors.bankInformation[index].accountNumber.message}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        readOnly={viewMode}
                        {...register(`bankInformation.${index}.mobilePayNumber`)}
                        placeholder="0414-1234567"
                        maxLength={12}
                        className={`input-dark text-sm ${disabledClasses}`}
                      />
                      {errors?.bankInformation?.[index]?.mobilePayNumber && (
                        <p className="text-red-400 text-xs mt-1">{errors.bankInformation[index].mobilePayNumber.message}</p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <ButtonTrash disabled={viewMode} remove={remove} index={index} dynamicClasses={disabledClasses} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
}
