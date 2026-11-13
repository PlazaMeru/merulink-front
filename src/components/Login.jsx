import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/AuthContext.jsx';

import GuestBar from './Shared/GuestBar';
import NameApp from './Shared/NameApp';
import ErrorMessage from './Shared/ErrorMessage';
import { PasswordInputEye } from './togglePasswordVisibility';
import { loginValidationSchema } from '../utils/Validations/loginValidationSchema';
import LabelUppercase from './Shared/LabelUppercase';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });
  const { authLogin } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError(null);
    try {
      const response = await authLogin(data);
      if (response.requiresPasswordChange) {
        navigate('/cambiar-contrasena');
      } else if (response) {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('Error de conexión con el servidor. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <GuestBar />
      <div className="min-h-screen min-w-full bg-[#1e2022] flex items-center justify-center p-4">
        
        <div className="w-full max-w-md p-6 bg-[#2f3235] rounded-xl border border-[#43474a] shadow-2xl">
          
          {/* Encabezado */}
          <div className="flex flex-col items-center mb-6">
            <NameApp dynamicClasses="text-2xl uppercase"/>
            <p className="text-xs text-gray-400 mt-1">Gestión de Empleados</p>
          </div>

          {/* Alerta de Error de la API */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            
            {/* Email */}
            <div className="flex flex-col gap-1">
              <LabelUppercase text="Nombre Usuario" />
              <input
                type="text"
                autoFocus
                placeholder="Nombre usuario Ejem: n.apellido"
                {...register('username')}
                className="input-dark"
              />
              {errors.username && ( <ErrorMessage msg={errors.username.message} /> )}
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1">
              <LabelUppercase text="Contraseña" />
              <PasswordInputEye
                register={register}
                errors={errors}
                name="password"
                placeholder="••••••••"
                hasUserCreated={false}
                dynamicClasses="!bg-[#252729]"
              />
            </div>

            {/* Botón de Ingreso */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full mt-2 p-2.5 rounded-lg text-sm font-bold text-white uppercase tracking-wider transition-all shadow-md
                ${submitting 
                  ? 'bg-[#00A4BC]/50 cursor-not-allowed text-gray-300' 
                  : 'bg-[#00A4BC] hover:bg-[#008b9f] active:scale-[0.98]'
                }`}
            >
              {submitting ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
            <div className="-mt-3 text-center">
              <Link className="link-invite-mode" to={"/"}>
                Modo Invitado
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;