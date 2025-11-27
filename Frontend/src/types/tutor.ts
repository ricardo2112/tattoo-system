export interface Tutor {
  idTutor: number;
  identificacion?: string;
  nombre: string;
  apellido: string;
  parentezco?: string;
}

export interface TutorFormData extends Omit<Tutor, 'idTutor'> {
  idTutor?: number;
}
