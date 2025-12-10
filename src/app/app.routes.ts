import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
//import { SeccionMateriasComponent } from './seccion-materias/seccion-materias';
//import { SeccionUnidadesComponent } from './seccion-unidades/seccion-unidades';
//import { SeccionContenido } from './seccion-contenido/seccion-contenido';
//import { SeccionEjerciciosComponent } from './seccion-ejercicios/seccion-ejercicios';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'login', component: Login },
//    { path: 'seccion-materias', component: SeccionMateriasComponent },
  //  { path: 'seccion-materias/:materiaId/unidades', component: SeccionUnidadesComponent },
    //{ path: 'seccion-materias/:materiaId/unidades/:unidadId/contenido', component: SeccionContenido },
    //{ path: 'seccion-materias/:materiaId/unidades/:unidadId/ejercicios', component: SeccionEjerciciosComponent },
  { path: '**', redirectTo: '' } // Redirige rutas no encontradas al login
];