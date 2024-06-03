const assets = {
  'default-vert': {
    path: '/assets/shaders/default.vert',
    type: 'shader',
  },
  'default-frag': {
    path: '/assets/shaders/default.frag',
    type: 'shader',
  },
  'terrain-vert': {
    path: '/assets/shaders/terrain.vert',
    type: 'shader',
  },
  'terrain-frag': {
    path: '/assets/shaders/terrain.frag',
    type: 'shader',
  },
  'kayak-model': {
    path: '/assets/kayak.ply',
    type: 'ply',
  }
};


export async function loadAll() {
  const assetMap = new Map();
  for (const [name, details] of Object.entries(assets)) {
    try {

      const res = await fetch(details.path);
      if (!res.ok) {
        throw new Error();
      }

      if (details.type === 'text' || details.type === 'shader') {
        const text = await res.text();
        assetMap.set(name, text);
      }

      if (details.type === 'ply' || details.type === 'model') {
        const buffer = await res.arrayBuffer();
        assetMap.set(name, buffer);
      }

      // TODO (seamus) : What about images, sounds etc!


    } catch (e) {
      throw new Error(`Error loading asset: ${name}.`);
    }
  }
  return assetMap;
}