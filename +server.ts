import { json } from '@sveltejs/kit';

// POST: Recibe los datos del formulario de contacto
export async function POST({ request }) {
  try {
    const data = await request.formData();
    const nombre = data.get('nombre');
    const email = data.get('email');
    const mensaje = data.get('mensaje');

    if (!nombre || !email || !mensaje) {
      return json({ error: 'Por favor, completa todos los campos.' }, { status: 400 });
    }

    // AQUÍ: En el futuro puedes conectar un servicio como Resend, Nodemailer o SendGrid 
    // para que te envíe un email real a tu casilla de correo.
    // Por ahora, simulamos que se envió con éxito y lo mostramos en la terminal.
    console.log('📬 Nuevo mensaje de contacto recibido:', { nombre, email, mensaje });

    return json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    return json({ error: 'Error interno al procesar el mensaje.' }, { status: 500 });
  }
}