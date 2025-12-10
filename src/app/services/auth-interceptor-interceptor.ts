// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  // Verificar si estamos en el navegador (no en SSR)
  let token: string | null = null;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    // Obtener el token del localStorage solo si estamos en el navegador
    token = localStorage.getItem('access_token');
  }
  
  // Si hay token, clonar la request y agregar el header Authorization
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  // Si no hay token, continuar con la request original
  return next(req);
};
