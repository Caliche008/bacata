import { Button } from '../../../components';

/**
 * Aviso previo a un ejercicio sensible (R12.3/R12.4). Muestra la `notaContexto`
 * con enfoque de dignidad, antes de que el estudiante vea el ejercicio, y ofrece
 * dos acciones claras: continuar con cuidado o OMITIR (omitir no bloquea
 * completar la lección). Los botones usan `Button` (objetivo táctil ≥44px) y la
 * nota se expone con `role="note"`.
 */

export interface AvisoSensibleProps {
  notaContexto: string;
  onContinuar: () => void;
  onOmitir: () => void;
}

export function AvisoSensible({ notaContexto, onContinuar, onOmitir }: AvisoSensibleProps) {
  return (
    <div className="bc-sensible">
      <p className="bc-sensible__titulo">
        <span className="bc-sensible__icono" aria-hidden="true">
          🫶
        </span>
        Tema sensible
      </p>
      <p className="bc-sensible__nota" role="note">
        {notaContexto}
      </p>
      <p className="bc-sensible__ayuda">
        Puedes verlo con calma o pasar a lo siguiente. Omitirlo no afecta tu avance.
      </p>
      <div className="bc-sensible__acciones">
        <Button variant="primary" onClick={onContinuar}>
          Ver con cuidado
        </Button>
        <Button variant="secondary" onClick={onOmitir}>
          Omitir este ejercicio
        </Button>
      </div>
    </div>
  );
}
