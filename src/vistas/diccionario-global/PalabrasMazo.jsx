/**
 * @file PalabrasMazo.jsx
 * @brief Ruta /estudiante|invitado/mazos/:idMazo/palabras: palabras aprobadas de un mazo.
 */

import { useParams } from 'react-router-dom';
import { DiccionarioGlobal } from './DiccionarioGlobal';

/**
 * @brief Lee el id del mazo de la URL y muestra el diccionario filtrado por ese mazo.
 * @return {JSX.Element}
 */
export function PalabrasMazo() {
  const { idMazo } = useParams();
  return <DiccionarioGlobal idMazo={idMazo} />;
}
