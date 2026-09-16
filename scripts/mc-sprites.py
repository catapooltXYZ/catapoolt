#!/usr/bin/env python3
"""Minecraft Java-style cuboid entity sprites for Catapoolt.

Imagine quota is empty; this is the AGENTS.md fallback (code-drawn pixel art).
Side-view 3/4 cuboids with per-texel lighting — same language as the Steve Hood
pig, original cat / mouse / fish / catapult (not a clone).
"""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT = Path("/workspace/public/sprites")
XDIR = Path("/workspace/public/x")
OUT.mkdir(parents=True, exist_ok=True)
XDIR.mkdir(parents=True, exist_ok=True)

INK = (26, 20, 16, 255)
SKY = (143, 212, 255, 255)
GRASS = (84, 194, 71, 255)
GRASS_D = (58, 158, 52, 255)
DIRT = (139, 90, 43, 255)
DIRT_D = (107, 63, 26, 255)
GOLD = (242, 212, 74, 255)
BUY = (61, 155, 58, 255)
PAPER = (255, 247, 230, 255)

# Camera: slight 3/4 so cuboid tops + fronts read like Minecraft entities.
YAW = math.radians(32)
PITCH = math.radians(18)


def shade(rgb: tuple[int, int, int], k: float) -> tuple[int, int, int]:
    return tuple(max(0, min(255, int(c * k))) for c in rgb)  # type: ignore[return-value]


def rot(x: float, y: float, z: float) -> tuple[float, float, float]:
    cy, sy = math.cos(YAW), math.sin(YAW)
    x1 = x * cy + z * sy
    z1 = -x * sy + z * cy
    cp, sp = math.cos(PITCH), math.sin(PITCH)
    y1 = y * cp - z1 * sp
    z2 = y * sp + z1 * cp
    return x1, y1, z2


class Canvas:
    def __init__(self, w: int, h: int):
        self.w, self.h = w, h
        self.rgba = np.zeros((h, w, 4), dtype=np.uint8)
        self.zbuf = np.full((h, w), -1e9, dtype=np.float32)

    def fill_tri(
        self,
        p0: tuple[float, float],
        p1: tuple[float, float],
        p2: tuple[float, float],
        z: float,
        col: tuple[int, int, int, int],
    ) -> None:
        xs = (p0[0], p1[0], p2[0])
        ys = (p0[1], p1[1], p2[1])
        minx = max(0, int(math.floor(min(xs))))
        maxx = min(self.w - 1, int(math.ceil(max(xs))))
        miny = max(0, int(math.floor(min(ys))))
        maxy = min(self.h - 1, int(math.ceil(max(ys))))
        if minx > maxx or miny > maxy:
            return
        ax, ay = p0
        bx, by = p1
        cx, cy = p2
        den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-8:
            return
        col_a = np.array(col, dtype=np.uint8)
        for y in range(miny, maxy + 1):
            for x in range(minx, maxx + 1):
                w0 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / den
                w1 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / den
                w2 = 1.0 - w0 - w1
                if w0 < -0.02 or w1 < -0.02 or w2 < -0.02:
                    continue
                if z >= self.zbuf[y, x]:
                    self.zbuf[y, x] = z
                    self.rgba[y, x] = col_a

    def fill_quad(self, pts: list[tuple[float, float]], z: float, col: tuple[int, int, int, int]) -> None:
        self.fill_tri(pts[0], pts[1], pts[2], z, col)
        self.fill_tri(pts[0], pts[2], pts[3], z, col)

    def image(self) -> Image.Image:
        return Image.fromarray(self.rgba, "RGBA")


def outline(im: Image.Image, col: tuple[int, int, int, int] = INK) -> Image.Image:
    arr = np.array(im)
    a = arr[:, :, 3] > 0
    if not a.any():
        return im
    edge = np.zeros_like(a)
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        rolled = np.roll(a, (dy, dx), (0, 1))
        if dy == -1:
            rolled[-1, :] = False
        if dy == 1:
            rolled[0, :] = False
        if dx == -1:
            rolled[:, -1] = False
        if dx == 1:
            rolled[:, 0] = False
        edge |= rolled
    edge &= ~a
    arr[edge] = col
    return Image.fromarray(arr, "RGBA")


def crop_pad(im: Image.Image, pad: int = 1) -> Image.Image:
    arr = np.array(im)
    a = arr[:, :, 3] > 0
    if not a.any():
        return im
    ys, xs = np.where(a)
    x0, x1 = max(0, xs.min() - pad), min(im.width - 1, xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(im.height - 1, ys.max() + pad)
    return im.crop((int(x0), int(y0), int(x1) + 1, int(y1) + 1))


def noise_k(seed: int, u: int, v: int) -> float:
    h = (seed * 374761393 + u * 668265263 + v * 1274126177) & 0xFFFFFFFF
    return 0.86 + ((h >> 8) % 29) / 100.0


class Scene:
    def __init__(self, w: int = 220, h: int = 160, scale: float = 3.2, ox: float | None = None, oy: float | None = None):
        self.cv = Canvas(w, h)
        self.scale = scale
        self.ox = w * 0.42 if ox is None else ox
        self.oy = h * 0.78 if oy is None else oy

    def proj(self, x: float, y: float, z: float) -> tuple[float, float, float]:
        sx, sy, sz = rot(x, y, z)
        return self.ox + sx * self.scale, self.oy - sy * self.scale, sz

    def box(
        self,
        x: float,
        y: float,
        z: float,
        sx: float,
        sy: float,
        sz: float,
        rgb: tuple[int, int, int],
        seed: int = 1,
    ) -> None:
        # 8 corners: (dx,dy,dz) in {0,1}
        def P(dx: float, dy: float, dz: float) -> tuple[float, float, float]:
            return self.proj(x + dx * sx, y + dy * sy, z + dz * sz)

        # faces: origin corner + axes (u_axis, v_axis), light, tex size
        faces = [
            ((0, 1, 0), (1, 0, 0), (0, 0, 1), 1.00, max(1, round(sx)), max(1, round(sz))),  # +Y top
            ((0, 0, 0), (1, 0, 0), (0, 1, 0), 0.78, max(1, round(sx)), max(1, round(sy))),  # -Z? wait front depends
            ((0, 0, 1), (1, 0, 0), (0, 1, 0), 0.62, max(1, round(sx)), max(1, round(sy))),  # +Z
            ((1, 0, 0), (0, 0, 1), (0, 1, 0), 0.88, max(1, round(sz)), max(1, round(sy))),  # +X front
            ((0, 0, 0), (0, 0, 1), (0, 1, 0), 0.55, max(1, round(sz)), max(1, round(sy))),  # -X back
            ((0, 0, 0), (1, 0, 0), (0, 0, 1), 0.45, max(1, round(sx)), max(1, round(sz))),  # -Y bottom
        ]
        # Keep the 3 camera-facing faces: top, +X (front), +Z (near side with our yaw)
        keep = (0, 2, 3)
        for idx in keep:
            origin, uax, vax, light, tw, th = faces[idx]
            ox, oy, oz = origin
            ux, uy, uz = uax
            vx, vy, vz = vax
            for i in range(tw):
                for j in range(th):
                    u0, u1 = i / tw, (i + 1) / tw
                    v0, v1 = j / th, (j + 1) / th
                    corners3 = [
                        (
                            x + (ox + ux * uu + vx * vv) * sx,
                            y + (oy + uy * uu + vy * vv) * sy,
                            z + (oz + uz * uu + vz * vv) * sz,
                        )
                        for uu, vv in ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
                    ]
                    pts = []
                    zs = []
                    for cx, cy, cz in corners3:
                        px, py, pz = self.proj(cx, cy, cz)
                        pts.append((px, py))
                        zs.append(pz)
                    zmid = sum(zs) / 4.0
                    k = light * noise_k(seed + idx * 17, i, j)
                    r, g, b = shade(rgb, k)
                    self.cv.fill_quad(pts, zmid, (r, g, b, 255))

    def stamp(self, up: int = 4) -> Image.Image:
        im = outline(self.cv.image())
        im = crop_pad(im, 1)
        if up > 1:
            im = im.resize((im.width * up, im.height * up), Image.Resampling.NEAREST)
        return im


def cat_model(sc: Scene, walk: int, x0: float = 0.0) -> None:
    # Facing +X. Black cat, lime eyes, orange collar. Minecraft cat proportions.
    BLACK = (28, 28, 32)
    GREY = (48, 48, 54)
    EYE = (140, 255, 42)
    COLLAR = (232, 93, 4)
    PINK = (220, 140, 140)
    lf = 1 if walk == 0 else -1
    # legs
    sc.box(x0 + 2 + lf, 0, -3.0, 2, 6, 2, BLACK, 11)  # back left
    sc.box(x0 + 2 - lf, 0, 1.0, 2, 6, 2, BLACK, 12)  # back right
    sc.box(x0 + 12 - lf, 0, -3.0, 2, 6, 2, BLACK, 13)
    sc.box(x0 + 12 + lf, 0, 1.0, 2, 6, 2, BLACK, 14)
    # body
    sc.box(x0 + 1, 6, -3.0, 14, 6, 6, BLACK, 10)
    # collar
    sc.box(x0 + 14.2, 6.2, -3.2, 1.2, 5.6, 6.4, COLLAR, 20)
    # head
    sc.box(x0 + 15, 7.2, -2.5, 5, 4.2, 5, BLACK, 21)
    # muzzle
    sc.box(x0 + 19.4, 7.2, -1.2, 1.4, 2.2, 2.4, GREY, 22)
    sc.box(x0 + 20.4, 7.4, -0.4, 0.6, 0.8, 0.8, PINK, 23)
    # ears
    sc.box(x0 + 15.4, 11.2, -2.5, 1.6, 1.8, 1.4, BLACK, 24)
    sc.box(x0 + 15.4, 11.2, 1.1, 1.6, 1.8, 1.4, BLACK, 25)
    sc.box(x0 + 15.7, 11.2, -2.2, 0.8, 1.0, 0.8, PINK, 26)
    sc.box(x0 + 15.7, 11.2, 1.4, 0.8, 1.0, 0.8, PINK, 27)
    # eyes on +X / +Z visible corner of head
    sc.box(x0 + 19.5, 9.2, -2.2, 0.7, 1.1, 1.0, EYE, 28)
    sc.box(x0 + 19.5, 9.2, 1.2, 0.7, 1.1, 1.0, EYE, 29)
    # tail (up then out)
    sc.box(x0 - 6, 10.5, -1.0, 7, 2, 2, BLACK, 30)
    sc.box(x0 - 9, 8.2, -1.0, 4, 2, 2, BLACK, 31)


def mouse_model(sc: Scene, walk: int, x0: float = 0.0) -> None:
    CREAM = (232, 208, 150)
    TAN = (196, 164, 104)
    PINK = (232, 140, 140)
    NOSE = (214, 86, 86)
    EYE = (26, 20, 16)
    lf = 1 if walk == 0 else -1
    sc.box(x0 + 1 + lf, 0, -2.2, 2, 4, 2, TAN, 41)
    sc.box(x0 + 1 - lf, 0, 0.4, 2, 4, 2, TAN, 42)
    sc.box(x0 + 7 - lf, 0, -2.2, 2, 4, 2, TAN, 43)
    sc.box(x0 + 7 + lf, 0, 0.4, 2, 4, 2, TAN, 44)
    sc.box(x0 + 0.5, 4, -2.4, 10, 5, 5, CREAM, 40)
    sc.box(x0 + 9.5, 4.4, -2.0, 4.2, 4.2, 4.2, CREAM, 50)
    sc.box(x0 + 13.2, 4.6, -0.7, 2.2, 2.0, 1.6, TAN, 51)
    sc.box(x0 + 15.0, 5.0, -0.3, 0.8, 0.9, 0.8, NOSE, 52)
    # ears
    sc.box(x0 + 10.0, 8.4, -2.2, 2.2, 2.4, 0.8, CREAM, 53)
    sc.box(x0 + 10.0, 8.4, 1.6, 2.2, 2.4, 0.8, CREAM, 54)
    sc.box(x0 + 10.4, 8.6, -2.0, 1.4, 1.6, 0.5, PINK, 55)
    sc.box(x0 + 10.4, 8.6, 1.8, 1.4, 1.6, 0.5, PINK, 56)
    sc.box(x0 + 13.4, 6.6, -1.8, 0.7, 0.9, 0.7, EYE, 57)
    sc.box(x0 + 13.4, 6.6, 1.2, 0.7, 0.9, 0.7, EYE, 58)
    # tail
    sc.box(x0 - 7, 5.5, -0.4, 8, 1.2, 1.2, TAN, 59)


def fish_model(sc: Scene, walk: int, x0: float = 0.0) -> None:
    ORG = (232, 110, 24)
    DARK = (176, 58, 10)
    WHITE = (255, 243, 224)
    EYE = (26, 20, 16)
    FIN = (232, 93, 4)
    bob = 0.6 if walk else 0.0
    sc.box(x0 + 3, 2 + bob, -2.0, 10, 5, 4, ORG, 70)
    sc.box(x0 + 3, 2 + bob, -2.0, 10, 1.6, 4, DARK, 71)
    sc.box(x0 + 5, 2.4 + bob, -2.0, 4, 2.2, 4.1, WHITE, 72)
    sc.box(x0 + 12.4, 2.6 + bob, -1.6, 3.2, 4.0, 3.2, ORG, 73)
    sc.box(x0 + 0, 3 + bob, -0.6, 3.4, 3.4, 1.2, FIN, 74)  # tail
    sc.box(x0 - 1.2, 2.4 + bob, -0.6, 1.8, 4.6, 1.2, DARK, 75)
    sc.box(x0 + 6, 6.6 + bob, -0.6, 3.2, 1.6, 1.2, FIN, 76)  # dorsal
    sc.box(x0 + 14.8, 4.4 + bob, -0.4, 0.8, 1.1, 0.8, EYE, 77)


def catapult_model(sc: Scene) -> None:
    OAK = (176, 132, 58)
    OAK_D = (138, 96, 36)
    DARK = (92, 58, 24)
    ROPE = (232, 93, 4)
    BASKET = (196, 122, 42)
    # wheels / feet
    sc.box(1, 0, -5, 4, 4, 2, DARK, 80)
    sc.box(1, 0, 3, 4, 4, 2, DARK, 81)
    sc.box(18, 0, -5, 4, 4, 2, DARK, 82)
    sc.box(18, 0, 3, 4, 4, 2, DARK, 83)
    # chassis
    sc.box(0, 4, -4.5, 24, 3, 9, OAK, 84)
    # uprights
    sc.box(6, 7, -3.5, 3, 14, 3, OAK_D, 85)
    sc.box(6, 7, 0.5, 3, 14, 3, OAK_D, 86)
    # crossbeam
    sc.box(5.5, 19, -3.5, 4, 2.4, 7, OAK, 87)
    # arm (stepped to read as a wound beam)
    sc.box(8, 18.2, -1.2, 16, 2.2, 2.4, OAK, 88)
    sc.box(22, 16.4, -1.6, 6, 2.2, 3.2, OAK_D, 89)
    # basket
    sc.box(26, 12.5, -3.0, 7, 4.5, 6, BASKET, 90)
    sc.box(26.4, 13.0, -2.6, 6.2, 1.4, 5.2, ROPE, 91)
    # rope
    sc.box(9, 10, -0.6, 1.2, 8, 1.2, ROPE, 92)


def water_model(sc: Scene) -> None:
    C1 = (62, 168, 196)
    C2 = (46, 130, 168)
    C3 = (90, 206, 220)
    sc.box(0, 0, 0, 8, 6, 8, C1, 100)
    sc.box(0, 5.2, 0, 8, 0.8, 8, C3, 101)
    sc.box(2, 3, 2, 4, 1, 4, C2, 102)


def save(im: Image.Image, name: str) -> Path:
    p = OUT / name
    im.save(p)
    print(name, im.size)
    return p


def make_entities() -> None:
    for i, walk in enumerate((0, 1)):
        sc = Scene(240, 170, scale=3.4, ox=95, oy=140)
        cat_model(sc, walk)
        save(sc.stamp(4), f"cat-{'a' if i == 0 else 'b'}.png")

    for i, walk in enumerate((0, 1)):
        sc = Scene(200, 140, scale=3.6, ox=90, oy=118)
        mouse_model(sc, walk)
        save(sc.stamp(4), f"mouse-{'a' if i == 0 else 'b'}.png")

    for i, walk in enumerate((0, 1)):
        sc = Scene(180, 110, scale=3.8, ox=70, oy=88)
        fish_model(sc, walk)
        save(sc.stamp(4), f"fish-{'a' if i == 0 else 'b'}.png")

    sc = Scene(280, 200, scale=3.0, ox=90, oy=175)
    catapult_model(sc)
    save(sc.stamp(4), "catapult.png")

    sc = Scene(90, 80, scale=4.0, ox=28, oy=62)
    water_model(sc)
    save(sc.stamp(4), "water.png")

    # Nav head: front-ish cat face, 16px then upscale.
    head = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(head)
    d.rectangle((4, 2, 6, 5), fill=(28, 28, 32, 255))  # L ear
    d.rectangle((9, 2, 11, 5), fill=(28, 28, 32, 255))
    d.rectangle((5, 3, 6, 4), fill=(220, 140, 140, 255))
    d.rectangle((9, 3, 10, 4), fill=(220, 140, 140, 255))
    d.rectangle((3, 5, 12, 14), fill=(28, 28, 32, 255))
    d.rectangle((5, 8, 6, 10), fill=(140, 255, 42, 255))
    d.rectangle((9, 8, 10, 10), fill=(140, 255, 42, 255))
    d.rectangle((4, 13, 11, 14), fill=(232, 93, 4, 255))
    d.rectangle((7, 11, 8, 12), fill=(220, 140, 140, 255))
    head = outline(head)
    save(head.resize((64, 64), Image.Resampling.NEAREST), "head.png")

    # Blocky Steve-Hood clouds
    cloud = Image.new("RGBA", (28, 10), (0, 0, 0, 0))
    d = ImageDraw.Draw(cloud)
    d.rectangle((6, 0, 16, 4), fill=(255, 255, 255, 255))
    d.rectangle((2, 3, 24, 9), fill=(255, 255, 255, 255))
    d.rectangle((0, 5, 27, 9), fill=(255, 255, 255, 255))
    d.rectangle((4, 8, 20, 9), fill=(232, 244, 255, 255))
    save(cloud.resize((112, 40), Image.Resampling.NEAREST), "cloud.png")

    # Dirt 16x16 tile
    dirt = Image.new("RGBA", (16, 16), DIRT)
    rng = np.random.default_rng(7)
    px = dirt.load()
    for y in range(16):
        for x in range(16):
            k = 0.78 + float(rng.random()) * 0.4
            if rng.random() < 0.08:
                px[x, y] = shade((90, 64, 36), k) + (255,)  # type: ignore
            else:
                px[x, y] = shade((139, 90, 43), k) + (255,)  # type: ignore
    save(dirt.resize((16, 16), Image.Resampling.NEAREST), "dirt.png")

    # Grass blade tile (top strip)
    grass = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    gp = grass.load()
    for y in range(16):
        for x in range(16):
            if y < 3:
                gp[x, y] = shade((58, 158, 52), 0.9 + (x * y % 5) * 0.03) + (255,)  # type: ignore
            elif y < 8:
                gp[x, y] = shade((84, 194, 71), 0.88 + (x + y) % 4 * 0.04) + (255,)  # type: ignore
            elif y < 11:
                gp[x, y] = shade((58, 158, 52), 0.85) + (255,)  # type: ignore
            else:
                gp[x, y] = shade((47, 122, 40), 0.9) + (255,)  # type: ignore
    save(grass, "grass.png")

    make_title()
    make_social()


GLYPHS: dict[str, list[str]] = {
    "$": [
        ".##.#.",
        "##.###",
        "##.#..",
        ".####.",
        "..#.##",
        "###.##",
        "#.##..",
    ],
    "P": [
        "#####.",
        "##..##",
        "##..##",
        "######",
        "##....",
        "##....",
        "##....",
    ],
    "O": [
        ".####.",
        "##..##",
        "##..##",
        "##..##",
        "##..##",
        "##..##",
        ".####.",
    ],
    "L": [
        "##....",
        "##....",
        "##....",
        "##....",
        "##....",
        "##....",
        "######",
    ],
    "T": [
        "######",
        "######",
        "..##..",
        "..##..",
        "..##..",
        "..##..",
        "..##..",
    ],
}


def blit_glyph(im: Image.Image, ch: str, x: int, y: int, color: tuple[int, int, int, int], s: int = 8) -> int:
    rows = GLYPHS[ch]
    d = ImageDraw.Draw(im)
    # ink outline
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c != "#":
                continue
            d.rectangle((x + (i - 1) * s, y + (j - 1) * s, x + (i + 2) * s - 1, y + (j + 2) * s - 1), fill=INK)
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c != "#":
                continue
            d.rectangle((x + i * s, y + j * s, x + (i + 1) * s - 1, y + (j + 1) * s - 1), fill=color)
    return len(rows[0]) * s + s


def make_title() -> None:
    s = 10
    # $ POOLT  — measure
    text = "$POOLT"
    w = 0
    for ch in text:
        w += len(GLYPHS[ch][0]) * s + s
    h = 7 * s + 20
    im = Image.new("RGBA", (w + 20, h), (0, 0, 0, 0))
    x = 8
    y = 8
    x += blit_glyph(im, "$", x, y, BUY, s)
    for ch in "POOLT":
        x += blit_glyph(im, ch, x, y, GOLD, s)
    save(crop_pad(im, 2), "title.png")


def paste(dst: Image.Image, src: Image.Image, x: int, y: int, h: int | None = None) -> None:
    im = src
    if h is not None:
        w = max(1, int(im.width * (h / im.height)))
        im = im.resize((w, h), Image.Resampling.NEAREST)
    dst.alpha_composite(im, (int(x), int(y)))


def draw_ground(im: Image.Image, grass_y: int, dirt_h: int = 48) -> None:
    d = ImageDraw.Draw(im)
    d.rectangle((0, grass_y, im.width, grass_y + 14), fill=GRASS)
    d.rectangle((0, grass_y, im.width, grass_y + 4), fill=GRASS_D)
    d.rectangle((0, grass_y + 14, im.width, grass_y + 14 + dirt_h), fill=DIRT)
    # dirt noise
    rng = np.random.default_rng(3)
    px = im.load()
    for _ in range(im.width * 4):
        x = int(rng.integers(0, im.width))
        y = int(rng.integers(grass_y + 14, min(im.height, grass_y + 14 + dirt_h)))
        px[x, y] = DIRT_D


def draw_sky_clouds(im: Image.Image) -> None:
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, im.width, im.height), fill=SKY)
    cloud = Image.open(OUT / "cloud.png")
    for x, y, sc in ((40, 50, 1.0), (int(im.width * 0.22), 90, 0.7), (int(im.width * 0.62), 40, 1.1), (int(im.width * 0.82), 110, 0.8)):
        c = cloud.resize((int(cloud.width * sc), int(cloud.height * sc)), Image.Resampling.NEAREST)
        im.alpha_composite(c, (x, y))


def make_social() -> None:
    cat = Image.open(OUT / "cat-a.png")
    catb = Image.open(OUT / "cat-b.png")
    mouse = Image.open(OUT / "mouse-a.png")
    mouseb = Image.open(OUT / "mouse-b.png")
    fish = Image.open(OUT / "fish-a.png")
    catapult = Image.open(OUT / "catapult.png")
    water = Image.open(OUT / "water.png")
    title = Image.open(OUT / "title.png")
    head = Image.open(OUT / "head.png")

    def scene(w: int, h: int, title_w: int | None = None) -> Image.Image:
        im = Image.new("RGBA", (w, h), SKY)
        draw_sky_clouds(im)
        gy = int(h * 0.72)
        draw_ground(im, gy, dirt_h=h - gy - 14)
        # actors on grass
        paste(im, catapult, int(w * 0.08), gy + 14 - int(h * 0.28), h=int(h * 0.28))
        paste(im, cat, int(w * 0.04), gy + 14 - int(h * 0.18), h=int(h * 0.18))
        paste(im, mouse, int(w * 0.38), gy + 14 - int(h * 0.12), h=int(h * 0.12))
        paste(im, mouseb, int(w * 0.48), gy + 14 - int(h * 0.11), h=int(h * 0.11))
        paste(im, water, int(w * 0.72), gy + 14 - int(h * 0.10), h=int(h * 0.10))
        paste(im, fish, int(w * 0.74), gy + 14 - int(h * 0.09), h=int(h * 0.08))
        paste(im, catb, int(w * 0.62), gy + 14 - int(h * 0.16), h=int(h * 0.16))
        if title_w:
            tw = title_w
            th = int(title.height * (tw / title.width))
            t = title.resize((tw, th), Image.Resampling.NEAREST)
            im.alpha_composite(t, ((w - tw) // 2, int(h * 0.10)))
        return im

    # X logo 800x800
    logo = Image.new("RGBA", (800, 800), SKY)
    draw_sky_clouds(logo)
    draw_ground(logo, 620, 166)
    paste(logo, cat, 250, 620 + 14 - 220, h=220)
    paste(logo, mouse, 80, 620 + 14 - 110, h=110)
    paste(logo, fish, 560, 620 + 14 - 90, h=90)
    t = title.resize((640, int(title.height * (640 / title.width))), Image.Resampling.NEAREST)
    logo.alpha_composite(t, ((800 - t.width) // 2, 80))
    logo.convert("RGB").save(XDIR / "logo.png")
    print("x/logo.png", logo.size)

    banner = scene(1500, 500, title_w=720)
    banner.convert("RGB").save(XDIR / "banner.png")
    banner.convert("RGB").save(XDIR / "banner.jpg", quality=92)
    print("x/banner", banner.size)

    cover = scene(1500, 600, title_w=780)
    cover.convert("RGB").save(XDIR / "cover.png")
    cover.convert("RGB").save(XDIR / "cover.jpg", quality=92)
    print("x/cover", cover.size)

    og = scene(1200, 630, title_w=680)
    og.convert("RGB").save(Path("/workspace/public/og.jpg"), quality=92)
    print("og.jpg", og.size)

    xb = scene(1200, 264, title_w=520)
    xb.convert("RGB").save(Path("/workspace/public/x-banner.jpg"), quality=92)
    print("x-banner.jpg", xb.size)

    # favicon raster companion is SVG; keep SVG pixel-updated separately.


if __name__ == "__main__":
    make_entities()
