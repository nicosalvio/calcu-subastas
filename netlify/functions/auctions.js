const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  // Obtenemos el siteID que Netlify ya provee internamente en las variables de entorno
  const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  
  // Inicializamos el almacén pasando el siteID de forma explícita para asegurar la conexión
  const store = getStore({
    name: "subastas",
    siteID: siteID,
    token: process.env.NETLIFY_AUTH_TOKEN // Opcional, pero ayuda si corre local o restringido
  });

  try {
    if (event.httpMethod === "GET") {
      const { blobs } = await store.list();
      const subastas = await Promise.all(
        blobs.map(async (b) => await store.get(b.key, { type: "json" }))
      );
      return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subastas) 
      };
    }

    if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body);
      if (!data.id) data.id = `subasta_${Date.now()}`;
      
      await store.setJSON(data.id, data);
      
      return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, id: data.id }) 
      };
    }

    return { statusCode: 405, body: "Método no permitido" };
  } catch (error) {
    console.error("Error en Netlify Blobs:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
