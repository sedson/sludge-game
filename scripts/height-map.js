function hash(v) {
    const [p_x, p_y] = [80 * ((v[0] * 0.3972743) % 1), 80 * ((v[2] * 0.3872743) % 1)]
    return (p_x * p_y * (p_x - p_y)) % 1
}

function heightMap(x,y,z) {
    const p = [Math.floor(x / 1.8), Math.floor(y / 1.8), Math.floor(z / 1.8)]
    const w = [p[0] % 1, p[1] % 1, p[2] % 1]

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
        2 * du[1] * (k2 + k5*u[2] + k5*u[0] + k7*u[2]*u[0]),
        2 * du[2] * (k3 + k6*u[0] + k4*u[1] + k7*u[0]*u[1]),
    ]
}

export function height(x, z) {
    const pos = [x / 15, 0, z / 15]
    let mapped = [0, 0, 0, 0]
    for (let i = 1; i < 8; i++) {
        const hM = heightMap(pos[0] * i, pos[1] * i, pos[2] * i)
        mapped = [
            mapped[0] + hM[0] / (4 * i),
            mapped[1] + hM[1] / (4 * i),
            mapped[2] + hM[2] / (4 * i),
            mapped[3] + hM[3] / (4 * i),
        ]
    }
    return [mapped[0] * 8 + 3, mapped[1] * 8, mapped[2] * 8, mapped[3] * 8]
}
