import { useState, useEffect } from 'react';
import { listarCursos } from '../../cliente-api/cursosApi';
import { crearMazo } from '../../cliente-api/mazosApi';
import { Aviso } from '../../componentes/comunes/Aviso';

// Lista fija basada en los ejemplos de Entrega 1 (p. 19). Ampliarla es una
// decisión de contenido, no de arquitectura.
const VARIANTES_REGIONALES = ['Británico', 'Nigeriano', 'Jamaicano', 'Ghanés'];

const CAMPOS_OBLIGATORIOS = ['curso_id', 'nombre_lectura', 'autor', 'semana', 'variante_regional_predeterminada'];

export function CrearMazoForm({ onMazoCreado }) {
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState({
    curso_id: '',
    nombre_lectura: '',
    autor: '',
    semana: '',
    variante_regional_predeterminada: VARIANTES_REGIONALES[0],
    estado: 'abierto',
  });
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarCursos().then(setCursos);
  }, []);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  function validar() {
    return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validar()) {
      setAviso({ tipo: 'error', mensaje: 'Completa todos los campos obligatorios antes de crear el mazo.' });
      return;
    }

    setEnviando(true);
    try {
      const mazoCreado = await crearMazo({ ...form, curso_id: Number(form.curso_id) });
      setAviso({ tipo: 'exito', mensaje: `Mazo "${mazoCreado.nombre_lectura}" creado correctamente.` });
      setForm((anterior) => ({ ...anterior, nombre_lectura: '', autor: '', semana: '' }));
      onMazoCreado?.(mazoCreado);
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo crear el mazo: ${error.message}` });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear estructura de mazo</h2>

      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      <label htmlFor="curso_id">Curso/grupo</label>
      <select id="curso_id" name="curso_id" value={form.curso_id} onChange={handleChange}>
        <option value="">Selecciona un curso</option>
        {cursos.map((curso) => (
          <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
        ))}
      </select>

      <label htmlFor="semana">Semana/periodo</label>
      <input id="semana" type="text" name="semana" value={form.semana} onChange={handleChange} />

      <label htmlFor="nombre_lectura">Obra literaria / lectura asignada</label>
      <input id="nombre_lectura" type="text" name="nombre_lectura" value={form.nombre_lectura} onChange={handleChange} />

      <label htmlFor="autor">Autor</label>
      <input id="autor" type="text" name="autor" value={form.autor} onChange={handleChange} />

      <label htmlFor="variante_regional_predeterminada">Variante regional predeterminada</label>
      <select
        id="variante_regional_predeterminada"
        name="variante_regional_predeterminada"
        value={form.variante_regional_predeterminada}
        onChange={handleChange}
      >
        {VARIANTES_REGIONALES.map((variante) => (
          <option key={variante} value={variante}>{variante}</option>
        ))}
      </select>

      <label htmlFor="estado">Estado inicial</label>
      <select id="estado" name="estado" value={form.estado} onChange={handleChange}>
        <option value="abierto">Abierto</option>
        <option value="cerrado">Cerrado</option>
      </select>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Creando...' : 'Crear mazo'}
      </button>
    </form>
  );
}