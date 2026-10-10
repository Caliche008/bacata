/**
 * API pública del panel docente (features/teacher), modo local.
 * El gate en `src/app` carga `PanelDocente` con `React.lazy` desde aquí.
 */

export { PanelDocente } from './PanelDocente';
export type { PanelDocenteProps } from './PanelDocente';

// Por defecto, el import dinámico de React.lazy necesita un export default.
export { PanelDocente as default } from './PanelDocente';
