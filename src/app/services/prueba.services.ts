// prueba.services.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interfaces basadas en los modelos Pydantic de main.py
export interface UserCreate {
  email: string;
  password: string;
  nombre: string;
  rol?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface MateriaCreate {
  id: string;
  nombre: string;
  orden?: number;
}

export interface UnidadCreate {
  id_materia: string;
  numero: number;
  titulo: string;
  descripcion: string;
}

export interface ContenidoCreate {
  tema_id: string;
  nombre_tema: string;
  texto_markdown: string;
  id_unidad: string;
  id_materia: string;
  numero?: number;
  descripcion?: string;
}



export interface AIConsulta {
  pregunta: string;
  tema_id: string;
}

export interface EjercicioCreate {
  tema_id: string;
  enunciado: string;
  respuesta_correcta: string;
  tipo?: string;
  opciones?: string[];
  dificultad?: string;
}

// Interfaces para actualizaciones CRUD
export interface MateriaUpdate {
  nombre?: string;
  orden?: number;
}

export interface UnidadUpdate {
  titulo?: string;
  descripcion?: string;
  numero?: number;
}

export interface ContenidoUpdate {
  nombre_tema?: string;
  texto_markdown?: string;
  descripcion?: string;
  numero?: number;
}

export interface EjercicioUpdate {
  enunciado?: string;
  respuesta_correcta?: string;
  tipo?: string;
  opciones?: string[];
  dificultad?: string;
}

export interface EjercicioRespuesta {
  ejercicio_id: string;
  respuesta: string;
}

// Interfaces de respuesta
export interface Materia {
  id: string;
  nombre: string;
  orden: number;
}

export interface Unidad {
  id: string;
  id_materia: string;
  numero: number;
  titulo: string;
  descripcion: string;
}

export interface Contenido {
  id: string;
  tema_id: string;
  nombre_tema: string;
  texto_markdown: string;
  id_unidad: string;
  id_materia: string;
  numero: number;
  descripcion?: string;
}

export interface Ejercicio {
  id: string;
  tema_id: string;
  enunciado: string;
  respuesta_correcta?: string; // Solo para admin
  tipo: string;
  opciones?: string[];
  dificultad: string;
  fecha_creacion?: Date;
}

export interface EstadisticasResponse {
  total_usuarios: number;
  total_admins: number;
  total_materias: number;
  total_unidades: number;
  total_contenidos: number;
  total_ejercicios: number;
}

export interface ConteoResponse {
  [key: string]: number | string | null | undefined;
}

export interface CorreccionResponse {
  es_correcta: boolean;
  puntuacion: number;
  retroalimentacion: string;
  explicacion_adicional: string;
}

export interface AIResponse {
  respuesta: string;
  contexto_usado_del_tema: string;
}

@Injectable({
  providedIn: 'root',
})
export class PruebaServices {
  private Api = "https://aplicacioneduwebapi.onrender.com/api/v1/";
  private http = inject(HttpClient);

  // Métodos de Autenticación
  register(user: UserCreate): Observable<any> {
    return this.http.post<any>(this.Api + 'auth/register', user);
  }

  login(credentials: { username: string; password: string }): Observable<Token> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return this.http.post<Token>(this.Api + 'auth/login', formData);
  }

  // Métodos Públicos
  getSaludo(): Observable<string> {
    return this.http.get<string>(this.Api + 'saludo');
  }

  getMaterias(): Observable<any[]> {
    console.log('🚀 Haciendo petición a:', this.Api + 'materias');
    return this.http.get<any[]>(this.Api + 'materias');
  }

  getUnidadesPorMateria(materiaId: string): Observable<any[]> {
    console.log('🚀 Haciendo petición a:', this.Api + `materias/${materiaId}/unidades`);
    console.log('📋 Con headers de autenticación');
    return this.http.get<any[]>(this.Api + `materias/${materiaId}/unidades`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Alias para compatibilidad con el componente seccion-materias
  getUnidades(materiaId: string): Observable<any[]> {
    return this.getUnidadesPorMateria(materiaId);
  }

  getTemaContent(temaId: string): Observable<any> {
    return this.http.get<any>(this.Api + `contenido/tema/${temaId}`);
  }

  // Métodos Públicos Adicionales
  getAllUnidades(): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(this.Api + 'unidades');
  }

  getContenidosPorUnidad(unidadId: string): Observable<Contenido[]> {
    const fullUrl = this.Api + `admin/contenidos?unidad_id=${unidadId}`;
    console.log('🚀 Haciendo petición a:', fullUrl);
    console.log('🆔 Unidad ID recibido:', unidadId);
    
    return this.http.get<Contenido[]>(fullUrl, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Métodos de IA (Público)
  consultaAI(consulta: AIConsulta): Observable<AIResponse> {
    return this.http.post<AIResponse>(this.Api + 'ai/consulta', consulta);
  }

  // ===============================================
  // MÉTODOS DE ADMINISTRADOR - CRUD COMPLETO
  // ===============================================
  
  // MATERIAS CRUD
  createMateria(materia: MateriaCreate): Observable<any> {
    return this.http.post<any>(this.Api + 'admin/materias', materia, { 
      headers: this.getAuthHeaders() 
    });
  }

  getAllMateriasAdmin(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.Api + 'admin/materias', { 
      headers: this.getAuthHeaders() 
    });
  }

  getMateriaById(materiaId: string): Observable<Materia> {
    return this.http.get<Materia>(this.Api + `admin/materias/${materiaId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateMateria(materiaId: string, materia: MateriaUpdate): Observable<any> {
    return this.http.put<any>(this.Api + `admin/materias/${materiaId}`, materia, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteMateria(materiaId: string): Observable<any> {
    return this.http.delete<any>(this.Api + `admin/materias/${materiaId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // UNIDADES CRUD
  createUnidad(unidad: UnidadCreate): Observable<any> {
    return this.http.post<any>(this.Api + 'admin/unidades', unidad, { 
      headers: this.getAuthHeaders() 
    });
  }

  getAllUnidadesAdmin(): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(this.Api + 'admin/unidades', { 
      headers: this.getAuthHeaders() 
    });
  }

  getUnidadById(unidadId: string): Observable<Unidad> {
    return this.http.get<Unidad>(this.Api + `admin/unidades/${unidadId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getUnidadesPorMateriaAdmin(materiaId: string): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(this.Api + `admin/unidades/materia/${materiaId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateUnidad(unidadId: string, unidad: UnidadUpdate): Observable<any> {
    return this.http.put<any>(this.Api + `admin/unidades/${unidadId}`, unidad, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteUnidad(unidadId: string): Observable<any> {
    return this.http.delete<any>(this.Api + `admin/unidades/${unidadId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // CONTENIDOS CRUD
  createContenido(contenido: ContenidoCreate): Observable<any> {
    return this.http.post<any>(this.Api + 'admin/contenido', contenido, { 
      headers: this.getAuthHeaders() 
    });
  }

  getAllContenidosAdmin(unidadId?: string, materiaId?: string): Observable<Contenido[]> {
    let url = this.Api + 'admin/contenidos';
    const params = [];
    if (unidadId) params.push(`unidad_id=${unidadId}`);
    if (materiaId) params.push(`materia_id=${materiaId}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    return this.http.get<Contenido[]>(url, { 
      headers: this.getAuthHeaders() 
    });
  }

  getContenidoById(temaId: string): Observable<Contenido> {
    return this.http.get<Contenido>(this.Api + `admin/contenidos/${temaId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateContenido(temaId: string, contenido: ContenidoUpdate): Observable<any> {
    return this.http.put<any>(this.Api + `admin/contenidos/${temaId}`, contenido, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteContenido(temaId: string): Observable<any> {
    return this.http.delete<any>(this.Api + `admin/contenido/${temaId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // EJERCICIOS CRUD
  createEjercicio(ejercicio: EjercicioCreate): Observable<any> {
    return this.http.post<any>(this.Api + 'admin/ejercicios', ejercicio, { 
      headers: this.getAuthHeaders() 
    });
  }

  getAllEjerciciosAdmin(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.Api + 'admin/ejercicios', { 
      headers: this.getAuthHeaders() 
    });
  }

  getEjercicioById(ejercicioId: string): Observable<Ejercicio> {
    return this.http.get<Ejercicio>(this.Api + `admin/ejercicios/ejercicio/${ejercicioId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getEjerciciosPorTema(temaId: string): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.Api + `admin/ejercicios/tema/${temaId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getEjerciciosPorTipo(tipo: string): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.Api + `admin/ejercicios/tipo/${tipo}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getEjerciciosPorDificultad(dificultad: string): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.Api + `admin/ejercicios/dificultad/${dificultad}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateEjercicio(ejercicioId: string, ejercicio: EjercicioUpdate): Observable<any> {
    return this.http.put<any>(this.Api + `admin/ejercicios/${ejercicioId}`, ejercicio, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteEjercicio(ejercicioId: string): Observable<any> {
    return this.http.delete<any>(this.Api + `admin/ejercicios/${ejercicioId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ===============================================
  // MÉTODOS DE ESTADÍSTICAS Y CONTEO
  // ===============================================
  
  getEstadisticas(): Observable<EstadisticasResponse> {
    console.log('Solicitando estadísticas...');
    return this.http.get<EstadisticasResponse>(this.Api + 'admin/estadisticas', { 
      headers: this.getAuthHeaders() 
    });
  }

  // Métodos de conteo
  countMaterias(): Observable<ConteoResponse> {
    return this.http.get<ConteoResponse>(this.Api + 'admin/count/materias', { 
      headers: this.getAuthHeaders() 
    });
  }

  countUnidades(materiaId?: string): Observable<ConteoResponse> {
    let url = this.Api + 'admin/count/unidades';
    if (materiaId) url += `?materia_id=${materiaId}`;
    
    return this.http.get<ConteoResponse>(url, { 
      headers: this.getAuthHeaders() 
    });
  }

  countContenidos(unidadId?: string, materiaId?: string): Observable<ConteoResponse> {
    let url = this.Api + 'admin/count/contenidos';
    const params = [];
    if (unidadId) params.push(`unidad_id=${unidadId}`);
    if (materiaId) params.push(`materia_id=${materiaId}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    return this.http.get<ConteoResponse>(url, { 
      headers: this.getAuthHeaders() 
    });
  }

  countEjercicios(temaId?: string, tipo?: string, dificultad?: string): Observable<ConteoResponse> {
    let url = this.Api + 'admin/count/ejercicios';
    const params = [];
    if (temaId) params.push(`tema_id=${temaId}`);
    if (tipo) params.push(`tipo=${tipo}`);
    if (dificultad) params.push(`dificultad=${dificultad}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    return this.http.get<ConteoResponse>(url, { 
      headers: this.getAuthHeaders() 
    });
  }

  // ===============================================
  // MÉTODOS LEGACY (Mantener por compatibilidad)
  // ===============================================
  
  getAllEjercicios(): Observable<Ejercicio[]> {
    return this.getAllEjerciciosAdmin();
  }

  getAllContenidos(): Observable<Contenido[]> {
    return this.getAllContenidosAdmin();
  }

  // ===============================================
  // MÉTODOS AUXILIARES
  // ===============================================
  
  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('access_token') || '';
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      return !!token;
    }
    return false;
  }

  // Método para cerrar sesión
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}