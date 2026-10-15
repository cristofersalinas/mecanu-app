import styles from './entrar.module.css';

/**
 * El conductor no pide el magic link desde la web: lo manda el taller por correo.
 * Esta pantalla solo explica eso (y muestra el error si el enlace caducó).
 */
export function EntrarForm() {
  return (
    <p className={styles.hint}>
      El acceso llega por correo. Ábrelo desde el mensaje que te enviamos;
      desde aquí no se pide ni se reenvía.
    </p>
  );
}
