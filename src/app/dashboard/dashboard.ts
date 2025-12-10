import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
// Service import
import { PruebaServices, MateriaCreate, UnidadCreate, ContenidoCreate, EjercicioCreate } from '../services/prueba.services';

interface NavItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private pruebaService = inject(PruebaServices);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Data properties
  materias: any[] = [];
  unidades: any[] = [];
  contenidos: any[] = [];
  ejercicios: any[] = [];
  
  // Selected items
  selectedMateria: any = null;
  selectedUnidad: any = null;
  
  // Stats
  totalMaterias = 0;
  totalUnidades = 0;
  totalContenidos = 0;
  totalEjercicios = 0;
  
  // UI State
  isLoading = false;
  showMateriaForm = false;
  showUnidadForm = false;
  showContenidoForm = false;
  showEjercicioForm = false;
  editingItem: any = null;
  
  // Forms
  materiaForm!: FormGroup;
  unidadForm!: FormGroup;
  contenidoForm!: FormGroup;
  ejercicioForm!: FormGroup;
  
  constructor() {
    this.initializeForms();
  }

  private initializeForms() {
    this.materiaForm = this.fb.group({
      nombre: ['', Validators.required],
      orden: [1, [Validators.required, Validators.min(1)]]
    });
    
    this.unidadForm = this.fb.group({
      numero: [1, [Validators.required, Validators.min(1)]],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
    
    this.contenidoForm = this.fb.group({
      tema_id: ['', Validators.required],
      nombre_tema: ['', Validators.required],
      texto_markdown: ['', Validators.required],
      numero: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['']
    });
    
    this.ejercicioForm = this.fb.group({
      enunciado: ['', Validators.required],
      respuesta_correcta: ['', Validators.required],
      tipo: ['multiple_choice', Validators.required],
      opciones: [''],
      dificultad: ['principiante', Validators.required]
    });
  }

  ngOnInit() {
    // Solo cargar datos si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    } else {
      // En SSR, usar datos por defecto
      this.materias = [
        { id: '1', nombre: 'Matemáticas', orden: 1 },
        { id: '2', nombre: 'Programación', orden: 2 },
        { id: '3', nombre: 'Base de Datos', orden: 3 }
      ];
      this.totalMaterias = this.materias.length;
    }
  }

  private loadInitialData() {
    this.loadMaterias();
  }

  loadMaterias() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.isLoading = true;
    this.pruebaService.getMaterias().subscribe({
      next: (materias: any[]) => {
        this.materias = materias;
        this.totalMaterias = materias.length;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading materias:', error);
        // Usar datos de prueba si falla la API
        this.materias = [
          { id: '1', nombre: 'Matemáticas', orden: 1 },
          { id: '2', nombre: 'Programación', orden: 2 },
          { id: '3', nombre: 'Base de Datos', orden: 3 }
        ];
        this.totalMaterias = this.materias.length;
        this.isLoading = false;
      }
    });
  }

  selectMateria(materia: any) {
    this.selectedMateria = materia;
    this.selectedUnidad = null;
    this.unidades = [];
    this.contenidos = [];
    this.ejercicios = [];
    this.loadUnidades(materia.id);
  }

  private loadUnidades(materiaId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.isLoading = true;
    this.pruebaService.getUnidadesPorMateria(materiaId).subscribe({
      next: (unidades: any[]) => {
        this.unidades = unidades;
        this.totalUnidades = unidades.length;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading unidades:', error);
        // Datos de prueba
        this.unidades = [
          { numero: 1, titulo: 'Introducción', descripcion: 'Conceptos básicos' },
          { numero: 2, titulo: 'Fundamentos', descripcion: 'Principios fundamentales' }
        ];
        this.totalUnidades = this.unidades.length;
        this.isLoading = false;
      }
    });
  }

  selectUnidad(unidad: any) {
    this.selectedUnidad = unidad;
    this.contenidos = [];
    this.ejercicios = [];
    this.totalContenidos = 0;
    this.totalEjercicios = 0;
    
    console.log('🔍 Unidad seleccionada:', unidad);
    console.log('🆔 ID de unidad:', unidad.id);
    console.log('🔢 Número de unidad:', unidad.numero);
    
    // Usar el id de la unidad (que viene del backend como doc.id)
    const unidadId = unidad.id;
    if (unidadId) {
      this.loadContenidos(unidadId);
    } else {
      console.error('❌ No se encontró ID de unidad');
      // Intentar usar algún identificador alternativo
      const alternativeId = unidad._id || unidad.numero || unidad.titulo;
      if (alternativeId) {
        console.log('🔄 Intentando con ID alternativo:', alternativeId);
        this.loadContenidos(alternativeId.toString());
      } else {
        // Mostrar mensaje de error
        this.contenidos = [];
        this.totalContenidos = 0;
        console.warn('⚠️ No se puede cargar contenidos: falta identificador de unidad');
      }
    }
  }

  private loadContenidos(unidadId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    console.log('🔍 Cargando contenidos para unidad:', unidadId);
    console.log('📞 Usando nuevo endpoint getAllContenidosAdmin con filtro');
    this.isLoading = true;
    
    // Usar el nuevo método con filtro por unidad
    this.pruebaService.getAllContenidosAdmin(unidadId).subscribe({
      next: (contenidos: any[]) => {
        console.log('✅ Contenidos cargados:', contenidos);
        this.contenidos = contenidos;
        this.totalContenidos = contenidos.length;
        this.isLoading = false;
        
        // También cargar ejercicios para la unidad
        this.loadEjerciciosPorUnidad(unidadId);
      },
      error: (error: any) => {
        console.error('❌ Error loading contenidos:', error);
        console.error('📋 Status:', error.status);
        console.error('📋 Message:', error.message);
        
        // Intentar con el método de conteo para verificar si hay contenidos
        this.pruebaService.countContenidos(unidadId).subscribe({
          next: (count) => {
            console.log('📊 Conteo de contenidos:', count);
            if (count['total_contenidos'] === 0) {
              this.contenidos = [];
              this.totalContenidos = 0;
            } else {
              // Si hay contenidos pero falla la carga, mostrar datos de prueba
              this.contenidos = [
                { 
                  id: '1',
                  tema_id: '1', 
                  nombre_tema: 'Contenido no disponible', 
                  numero: 1, 
                  descripcion: 'Error al cargar contenido desde el servidor',
                  id_unidad: unidadId
                }
              ];
              this.totalContenidos = 1;
            }
          },
          error: (countError) => {
            console.error('❌ Error en conteo:', countError);
            this.contenidos = [];
            this.totalContenidos = 0;
          }
        });
        
        this.isLoading = false;
      }
    });
  }

  private loadEjerciciosPorUnidad(unidadId: string) {
    // Por ahora, obtener todos los ejercicios y filtrar por los temas de esta unidad
    this.pruebaService.getAllEjerciciosAdmin().subscribe({
      next: (todosEjercicios: any[]) => {
        // Filtrar ejercicios que pertenezcan a contenidos de esta unidad
        const temasUnidad = this.contenidos.map(c => c.tema_id || c.id);
        this.ejercicios = todosEjercicios.filter(ej => 
          temasUnidad.includes(ej.tema_id)
        );
        this.totalEjercicios = this.ejercicios.length;
        console.log('✅ Ejercicios cargados para unidad:', this.ejercicios.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading ejercicios:', error);
        this.ejercicios = [];
        this.totalEjercicios = 0;
      }
    });
  }

  loadEjerciciosPorTema(temaId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    console.log('🔍 Cargando ejercicios para tema:', temaId);
    this.pruebaService.getEjerciciosPorTema(temaId).subscribe({
      next: (ejercicios: any[]) => {
        console.log('✅ Ejercicios del tema cargados:', ejercicios);
        // Aquí podrías hacer algo con los ejercicios del tema específico
      },
      error: (error: any) => {
        console.error('❌ Error loading ejercicios del tema:', error);
      }
    });
  }

  verContenido(contenido: any) {
    console.log('📝 Viendo contenido:', contenido);
    // Aquí puedes navegar a una página de detalle o abrir un modal
  }

  editarContenido(contenido: any) {
    console.log('✏️ Editando contenido:', contenido);
    this.editingItem = contenido;
    this.contenidoForm.patchValue({
      tema_id: contenido.tema_id || contenido.id,
      nombre_tema: contenido.nombre_tema,
      texto_markdown: contenido.texto_markdown,
      numero: contenido.numero,
      descripcion: contenido.descripcion || ''
    });
    this.showContenidoForm = true;
  }

  // ==================== MÉTODOS CRUD MATERIAS ====================
  
  showCreateMateriaForm() {
    this.editingItem = null;
    this.materiaForm.reset();
    this.materiaForm.patchValue({ orden: this.materias.length + 1 });
    this.showMateriaForm = true;
  }

  editMateria(materia: any) {
    this.editingItem = materia;
    this.materiaForm.patchValue({
      nombre: materia.nombre,
      orden: materia.orden
    });
    this.showMateriaForm = true;
  }

  saveMateria() {
    if (this.materiaForm.valid) {
      const materiaData: MateriaCreate = {
        id: this.editingItem ? this.editingItem.id : Date.now().toString(),
        nombre: this.materiaForm.value.nombre,
        orden: this.materiaForm.value.orden
      };

      if (this.editingItem) {
        // Actualizar materia existente
        this.pruebaService.updateMateria(this.editingItem.id, materiaData).subscribe({
          next: () => {
            this.showMessage('Materia actualizada exitosamente');
            this.loadMaterias();
            this.cancelMateriaForm();
          },
          error: (error) => {
            console.error('Error updating materia:', error);
            this.showMessage('Error al actualizar la materia', true);
          }
        });
      } else {
        // Crear nueva materia
        this.pruebaService.createMateria(materiaData).subscribe({
          next: () => {
            this.showMessage('Materia creada exitosamente');
            this.loadMaterias();
            this.cancelMateriaForm();
          },
          error: (error) => {
            console.error('Error creating materia:', error);
            this.showMessage('Error al crear la materia', true);
          }
        });
      }
    }
  }

  deleteMateria(materia: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar la materia "${materia.nombre}"?`)) {
      this.pruebaService.deleteMateria(materia.id).subscribe({
        next: () => {
          this.showMessage('Materia eliminada exitosamente');
          this.loadMaterias();
          // Si la materia eliminada estaba seleccionada, limpiar selección
          if (this.selectedMateria?.id === materia.id) {
            this.selectedMateria = null;
            this.selectedUnidad = null;
            this.unidades = [];
            this.contenidos = [];
            this.ejercicios = [];
          }
        },
        error: (error) => {
          console.error('Error deleting materia:', error);
          this.showMessage('Error al eliminar la materia', true);
        }
      });
    }
  }

  cancelMateriaForm() {
    this.showMateriaForm = false;
    this.editingItem = null;
    this.materiaForm.reset();
  }

  // ==================== MÉTODOS CRUD UNIDADES ====================
  
  showCreateUnidadForm() {
    if (!this.selectedMateria) {
      this.showMessage('Selecciona una materia primero', true);
      return;
    }
    this.editingItem = null;
    this.unidadForm.reset();
    this.unidadForm.patchValue({ numero: this.unidades.length + 1 });
    this.showUnidadForm = true;
  }

  editUnidad(unidad: any) {
    this.editingItem = unidad;
    this.unidadForm.patchValue({
      numero: unidad.numero,
      titulo: unidad.titulo,
      descripcion: unidad.descripcion
    });
    this.showUnidadForm = true;
  }

  saveUnidad() {
    if (this.unidadForm.valid && this.selectedMateria) {
      const unidadData: UnidadCreate = {
        id_materia: this.selectedMateria.id,
        numero: this.unidadForm.value.numero,
        titulo: this.unidadForm.value.titulo,
        descripcion: this.unidadForm.value.descripcion
      };

      if (this.editingItem) {
        // Actualizar unidad existente
        this.pruebaService.updateUnidad(this.editingItem.id, unidadData).subscribe({
          next: () => {
            this.showMessage('Unidad actualizada exitosamente');
            this.loadUnidades(this.selectedMateria.id);
            this.cancelUnidadForm();
          },
          error: (error) => {
            console.error('Error updating unidad:', error);
            this.showMessage('Error al actualizar la unidad', true);
          }
        });
      } else {
        // Crear nueva unidad
        this.pruebaService.createUnidad(unidadData).subscribe({
          next: () => {
            this.showMessage('Unidad creada exitosamente');
            this.loadUnidades(this.selectedMateria.id);
            this.cancelUnidadForm();
          },
          error: (error) => {
            console.error('Error creating unidad:', error);
            this.showMessage('Error al crear la unidad', true);
          }
        });
      }
    }
  }

  deleteUnidad(unidad: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar la unidad "${unidad.titulo}"?`)) {
      this.pruebaService.deleteUnidad(unidad.id).subscribe({
        next: () => {
          this.showMessage('Unidad eliminada exitosamente');
          this.loadUnidades(this.selectedMateria.id);
          // Si la unidad eliminada estaba seleccionada, limpiar selección
          if (this.selectedUnidad?.id === unidad.id) {
            this.selectedUnidad = null;
            this.contenidos = [];
            this.ejercicios = [];
          }
        },
        error: (error) => {
          console.error('Error deleting unidad:', error);
          this.showMessage('Error al eliminar la unidad', true);
        }
      });
    }
  }

  cancelUnidadForm() {
    this.showUnidadForm = false;
    this.editingItem = null;
    this.unidadForm.reset();
  }

  // ==================== MÉTODOS CRUD CONTENIDOS ====================
  
  showCreateContenidoForm() {
    if (!this.selectedUnidad) {
      this.showMessage('Selecciona una unidad primero', true);
      return;
    }
    this.editingItem = null;
    this.contenidoForm.reset();
    this.contenidoForm.patchValue({ 
      numero: this.contenidos.length + 1,
      tema_id: `tema_${Date.now()}`
    });
    this.showContenidoForm = true;
  }

  saveContenido() {
    if (this.contenidoForm.valid && this.selectedUnidad && this.selectedMateria) {
      const contenidoData: ContenidoCreate = {
        tema_id: this.contenidoForm.value.tema_id,
        nombre_tema: this.contenidoForm.value.nombre_tema,
        texto_markdown: this.contenidoForm.value.texto_markdown,
        id_unidad: this.selectedUnidad.id,
        id_materia: this.selectedMateria.id,
        numero: this.contenidoForm.value.numero,
        descripcion: this.contenidoForm.value.descripcion
      };

      if (this.editingItem) {
        // Actualizar contenido existente
        this.pruebaService.updateContenido(this.editingItem.tema_id || this.editingItem.id, contenidoData).subscribe({
          next: () => {
            this.showMessage('Contenido actualizado exitosamente');
            this.loadContenidos(this.selectedUnidad.id);
            this.cancelContenidoForm();
          },
          error: (error) => {
            console.error('Error updating contenido:', error);
            this.showMessage('Error al actualizar el contenido', true);
          }
        });
      } else {
        // Crear nuevo contenido
        this.pruebaService.createContenido(contenidoData).subscribe({
          next: () => {
            this.showMessage('Contenido creado exitosamente');
            this.loadContenidos(this.selectedUnidad.id);
            this.cancelContenidoForm();
          },
          error: (error) => {
            console.error('Error creating contenido:', error);
            this.showMessage('Error al crear el contenido', true);
          }
        });
      }
    }
  }

  deleteContenido(contenido: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar el contenido "${contenido.nombre_tema}"?`)) {
      this.pruebaService.deleteContenido(contenido.tema_id || contenido.id).subscribe({
        next: () => {
          this.showMessage('Contenido eliminado exitosamente');
          this.loadContenidos(this.selectedUnidad.id);
        },
        error: (error) => {
          console.error('Error deleting contenido:', error);
          this.showMessage('Error al eliminar el contenido', true);
        }
      });
    }
  }

  cancelContenidoForm() {
    this.showContenidoForm = false;
    this.editingItem = null;
    this.contenidoForm.reset();
  }

  // ==================== MÉTODOS CRUD EJERCICIOS ====================
  
  showCreateEjercicioForm() {
    if (!this.selectedUnidad || this.contenidos.length === 0) {
      this.showMessage('Necesitas tener al menos un contenido en la unidad para crear ejercicios', true);
      return;
    }
    this.editingItem = null;
    this.ejercicioForm.reset();
    this.ejercicioForm.patchValue({ 
      tipo: 'multiple_choice',
      dificultad: 'principiante'
    });
    this.showEjercicioForm = true;
  }

  editEjercicio(ejercicio: any) {
    this.editingItem = ejercicio;
    this.ejercicioForm.patchValue({
      enunciado: ejercicio.enunciado,
      respuesta_correcta: ejercicio.respuesta_correcta,
      tipo: ejercicio.tipo || 'multiple_choice',
      opciones: ejercicio.opciones ? ejercicio.opciones.join(', ') : '',
      dificultad: ejercicio.dificultad || 'principiante'
    });
    this.showEjercicioForm = true;
  }

  saveEjercicio() {
    if (this.ejercicioForm.valid) {
      // Si no hay tema seleccionado, usar el primer contenido disponible
      let temaId = this.editingItem ? this.editingItem.tema_id : '';
      if (!temaId && this.contenidos.length > 0) {
        temaId = this.contenidos[0].tema_id || this.contenidos[0].id;
      }

      if (!temaId) {
        this.showMessage('No se puede crear el ejercicio: falta tema ID', true);
        return;
      }

      const ejercicioData: EjercicioCreate = {
        tema_id: temaId,
        enunciado: this.ejercicioForm.value.enunciado,
        respuesta_correcta: this.ejercicioForm.value.respuesta_correcta,
        tipo: this.ejercicioForm.value.tipo,
        opciones: this.ejercicioForm.value.opciones ? 
          this.ejercicioForm.value.opciones.split(',').map((opt: string) => opt.trim()) : undefined,
        dificultad: this.ejercicioForm.value.dificultad
      };

      if (this.editingItem) {
        // Actualizar ejercicio existente
        this.pruebaService.updateEjercicio(this.editingItem.id, ejercicioData).subscribe({
          next: () => {
            this.showMessage('Ejercicio actualizado exitosamente');
            this.loadEjerciciosPorUnidad(this.selectedUnidad.id);
            this.cancelEjercicioForm();
          },
          error: (error) => {
            console.error('Error updating ejercicio:', error);
            this.showMessage('Error al actualizar el ejercicio', true);
          }
        });
      } else {
        // Crear nuevo ejercicio
        this.pruebaService.createEjercicio(ejercicioData).subscribe({
          next: () => {
            this.showMessage('Ejercicio creado exitosamente');
            this.loadEjerciciosPorUnidad(this.selectedUnidad.id);
            this.cancelEjercicioForm();
          },
          error: (error) => {
            console.error('Error creating ejercicio:', error);
            this.showMessage('Error al crear el ejercicio', true);
          }
        });
      }
    }
  }

  deleteEjercicio(ejercicio: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar este ejercicio?`)) {
      this.pruebaService.deleteEjercicio(ejercicio.id).subscribe({
        next: () => {
          this.showMessage('Ejercicio eliminado exitosamente');
          this.loadEjerciciosPorUnidad(this.selectedUnidad.id);
        },
        error: (error) => {
          console.error('Error deleting ejercicio:', error);
          this.showMessage('Error al eliminar el ejercicio', true);
        }
      });
    }
  }

  cancelEjercicioForm() {
    this.showEjercicioForm = false;
    this.editingItem = null;
    this.ejercicioForm.reset();
  }

  // ==================== MÉTODOS AUXILIARES ====================
  
  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'error-snackbar' : 'success-snackbar'
    });
  }

  // Métodos para obtener opciones de formularios
  getTiposEjercicio() {
    return ['multiple_choice', 'verdadero_falso', 'texto_libre', 'completar'];
  }

  getDificultades() {
    return ['principiante', 'intermedio', 'avanzado'];
  }

  getContenidosDisponibles() {
    return this.contenidos;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
