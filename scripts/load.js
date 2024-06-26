const assets = {
  'default-vert': {
    path: './assets/shaders/default.vert',
    type: 'shader',
  },
  'default-frag': {
    path: './assets/shaders/default.frag',
    type: 'shader',
  },
  'terrain-vert': {
    path: './assets/shaders/terrain.vert',
    type: 'shader',
  },
  'terrain-frag': {
    path: './assets/shaders/terrain.frag',
    type: 'shader',
  },
  'kayak-model': {
    path: './assets/kayak.ply',
    type: 'ply',
  },
  'kayak-rigging-model': {
    path: './assets/kayak_rigging.ply',
    type: 'ply',
  },
  'tree': {
    path: './assets/tree.ply',
    type: 'ply',
  },
  'tree-canopy': {
    path: './assets/tree-canopy.ply',
    type: 'ply',
  },
  'heron-model': {
    path: './assets/heron.ply',
    type: 'ply',
  },
  'tree-sprite': {
    path: './assets/tree_test_sprite.png',
    type: 'image',
  },
  'foliage-frag': {
    path: './assets/shaders/foliage.frag',
    type: 'shader',
  },
  'sprite-frag': {
    path: './assets/shaders/sprite.frag',
    type: 'shader',
  },
  'heron': {
    path: './assets/textures/heron-1.png',
    type: 'image',
  },
  'silhouettes': {
    path: './assets/textures/silhouettes.png',
    type: 'image',
  },
  'panorama': {
    path: './assets/panorama.ply',
    type: 'ply',
  },
  'terror-frag': {
    path: './assets/shaders/terror.frag',
    type: 'shader',
  },
  'water-frag': {
    path: './assets/shaders/water.frag',
    type: 'shader',
  },
  'fuel': {
    path: './assets/textures/fuel.png',
    type: 'image',
  },
  'beacon': {
    path: './assets/beacon.ply',
    type: 'ply',
  },
  'beaconwires': {
    path: './assets/beacon-wires.ply',
    type: 'ply',
  },
  'beacon-fuel': {
    path: './assets/beacon-fuel.ply',
    type: 'ply',
  },
  'raft': {
    path: '/assets/raft.ply',
    type: 'ply',
  },
  'raft-rigging': {
    path: '/assets/raft-rigging.ply',
    type: 'ply',
  },
  'raft-sprite': {
    path: '/assets/textures/raft.png',
    type: 'image',
  },
  'rowboat': {
    path: '/assets/rowboat.ply',
    type: 'ply',
  },
  'rowboat-sprite': {
    path: '/assets/textures/rowboat.png',
    type: 'image',
  },
  'rock': {
    path: '/assets/rock.ply',
    type: 'ply',
  },
  'algae': {
    path: '/assets/algae.ply',
    type: 'ply',
  },
  'beacon-frag': {
    path: './assets/shaders/beacon.frag',
    type: 'shader',
  }
};

function loadImg(src) {
  return new Promise((res, rej) => {
    let img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}


export async function loadAll() {
  const loadingTextUi = document.querySelector('.loading');
  const assetMap = new Map();
  for (const [name, details] of Object.entries(assets)) {
    if (loadingTextUi) {
      loadingTextUi.innerText = `loading ${name} @ ${details.path}`;
    }
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

      if (details.type === 'image') {
        const img = await loadImg(details.path);
        assetMap.set(name, img);
      }

    } catch (e) {
      throw new Error(`Error loading asset: ${name}.`);
    }
  }
  if (loadingTextUi) {
    loadingTextUi.innerText = `Done!`;
  }
  return assetMap;
}