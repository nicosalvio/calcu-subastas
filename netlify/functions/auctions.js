const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  try {
    // Inicializamos el almacén pasando explícitamente el Site ID y el Token de Netlify
    const store = getStore({
      name: "subastas",
      siteID: process.env.SITE_ID || process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_ACCESS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
    });

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
    console.error("Error crítico en Blobs:", error);
    return { 
      statusCode: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
