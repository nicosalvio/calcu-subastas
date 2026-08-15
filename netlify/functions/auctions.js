const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore("subastas");

  try {
    if (event.httpMethod === "GET") {
      const { blobs } = await store.list();
      const subastas = await Promise.all(
        blobs.map(async (b) => await store.get(b.key, { type: "json" }))
      );
      return { statusCode: 200, body: JSON.stringify(subastas) };
    }

    if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body);
      if (!data.id) data.id = `subasta_${Date.now()}`;
      await store.setJSON(data.id, data);
      return { statusCode: 200, body: JSON.stringify({ success: true, id: data.id }) };
    }

    return { statusCode: 405, body: "Método no permitido" };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
