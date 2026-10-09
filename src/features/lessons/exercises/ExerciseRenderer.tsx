import type { Ejercicio } from '../../../content';
import type {
  Respuesta,
  RespuestaAnalisisFuente,
  RespuestaCompletar,
  RespuestaDilema,
  RespuestaEmparejar,
  RespuestaOpcionMultiple,
  RespuestaOrdenar,
  RespuestaVerdaderoFalso,
} from '../answers';
import { AnalisisFuenteRenderer } from './AnalisisFuenteRenderer';
import { CompletarRenderer } from './CompletarRenderer';
import { DilemaRenderer } from './DilemaRenderer';
import { EmparejarRenderer } from './EmparejarRenderer';
import { OpcionMultipleRenderer } from './OpcionMultipleRenderer';
import { OrdenarRenderer } from './OrdenarRenderer';
import { VerdaderoFalsoRenderer } from './VerdaderoFalsoRenderer';

/**
 * Dispatcher de renderizadores (9.2). Selecciona el componente por
 * `ejercicio.tipo` con un `switch` exhaustivo; el `never` del `default` fuerza
 * que agregar un tipo nuevo rompa la compilación hasta cubrirlo. Desacopla el
 * flujo de los componentes concretos (que pueden cargarse perezosamente).
 *
 * El narrowing por `tipo` garantiza en compilación que ejercicio y respuesta
 * concuerdan; el `onChange` reenvía la respuesta ya tipada al flujo.
 */

export interface ExerciseRendererProps {
  ejercicio: Ejercicio;
  respuesta: Respuesta;
  onChange: (respuesta: Respuesta) => void;
  deshabilitado: boolean;
}

export function ExerciseRenderer({
  ejercicio,
  respuesta,
  onChange,
  deshabilitado,
}: ExerciseRendererProps) {
  switch (ejercicio.tipo) {
    case 'opcion_multiple':
      return (
        <OpcionMultipleRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaOpcionMultiple}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    case 'verdadero_falso':
      return (
        <VerdaderoFalsoRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaVerdaderoFalso}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    case 'emparejar':
      return (
        <EmparejarRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaEmparejar}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    case 'ordenar':
      return (
        <OrdenarRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaOrdenar}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    case 'completar':
      return (
        <CompletarRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaCompletar}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    case 'dilema':
      return (
        <DilemaRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaDilema}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    case 'analisis_fuente':
      return (
        <AnalisisFuenteRenderer
          ejercicio={ejercicio}
          respuesta={respuesta as RespuestaAnalisisFuente}
          onChange={onChange}
          deshabilitado={deshabilitado}
        />
      );
    default: {
      const _exhaustivo: never = ejercicio;
      return _exhaustivo;
    }
  }
}
