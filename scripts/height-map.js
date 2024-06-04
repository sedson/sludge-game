function hash(v) {
    const w = [v[0] * 0.3972743, v[1] * 0.3972743, v[2] * 0.3972743]
    const p = [
        80 * (w[0] - Math.floor(w[0])),
        80 * (w[1] - Math.floor(w[1])),
        80 * (w[2] - Math.floor(w[2]))
        ]
    const h = (p[0] * p[1] * (p[0] - p[1]) + p[2] * (p[0] + p[1]));
    return h - Math.floor(h)
}

function heightMap(x,y,z) {
    const p = [Math.floor(x / 1.8), Math.floor(y / 1.8), Math.floor(z / 1.8)]
    const w = [(x / 1.8) - p[0], (y / 1.8) - p[1], (z / 1.8) - p[2]]

    const u = [w[0] * w[0] * (3 - 2 * w[0]),
               w[1] * w[1] * (3 - 2 * w[1]),
               w[2] * w[2] * (3 - 2 * w[2])]
    const du = [6 * w[0] * (1 - w[0]),
                6 * w[1] * (1 - w[1]),
                6 * w[2] * (1 - w[2])]

    const a = hash(p)
    const b = hash([p[0] + 1, p[1], p[2]])
    const c = hash([p[0], p[1] + 1, p[2]])
    const d = hash([p[0] + 1, p[1] + 1, p[2]])
    const e = hash([p[0], p[1], p[2] + 1])
    const f = hash([p[0] + 1, p[1], p[2] + 1])
    const g = hash([p[0], p[1] + 1, p[2] + 1])
    const h = hash([p[0] + 1, p[1] + 1, p[2] + 1])

    const k0 = a
    const k1 = b - a
    const k2 = c - a
    const k3 = e - a
    const k4 = a - b - c + d
    const k5 = a - c - e + g
    const k6 = a - b - e + f
    const k7 = -a + b + c - d + e - f - g + h

    return [
        -1 + 2*(k0 + k1*u[0] + k2*u[1] + k3*u[2] + k4*u[0]*u[1] + k5*u[1]*u[2] + k6*u[2]*u[0] + k7*u[0]*u[1]*u[2]),
        2 * du[0] * (k1 + k4*u[1] + k6*u[2] + k7*u[1]*u[2]),
        2 * du[1] * (k2 + k5*u[2] + k4*u[0] + k7*u[2]*u[0]),
        2 * du[2] * (k3 + k6*u[0] + k5*u[1] + k7*u[0]*u[1]),
    ]
}

export function height(x, z) {
    const pos = [x / 10, 0, z / 10]
    let mapped = [0, 0, 0, 0]
    for (let i = 1; i < 8; i++) {
        const input = [pos[0] + 3 * (i-1), pos[1] + 3 * (i - 1), pos[2] + 3 * (i - 1)]
        const hM = heightMap(input[0] * i, input[1] * i, input[2] * i)
        mapped = [
            mapped[0] + hM[0] / (1 + 5 * (i - 1)),
            mapped[1] + hM[1] / (1 + 5 * (i - 1)),
            mapped[2] + hM[2] / (1 + 5 * (i - 1)),
            mapped[3] + hM[3] / (1 + 5 * (i - 1)),
        ]
    }
    return [mapped[0] * 8 + 1, mapped[1] * 8, mapped[2] * 8, mapped[3] * 8]
}
