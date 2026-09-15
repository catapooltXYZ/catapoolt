# repo/ — kurulum

Bu klasör bir iskelet değil, **hazır dosyalar**. TanStack Start projesini kendi
makinende oluştur, sonra bu dosyaları içine kopyala. Ben senin GitHub/Vercel
token'larını kullanmıyorum — push ve deploy senin elinde.

## 1. Proje

```bash
cd ~/Desktop/Catapoolt
npm create @tanstack/start@latest catapoolt   # React 19 + Vite + Tailwind seç
cd catapoolt
npm i viem
cp -R ../repo/src/lib/* src/lib/
cp -R ../repo/src/components/* src/components/
cp    ../repo/src/routes/index.tsx src/routes/index.tsx
mkdir -p contracts && cp ../repo/contracts/Basin.sol contracts/
npm run dev
```

Tailwind'e iki renk ekle (`src/styles.css` veya theme):

```css
@theme {
  --color-paper: #F5F1E8;
  --color-ink:   #121212;
}
```

Vercel: preset **TanStack Start** (Other değil). Root `.`, output boş.
Domain: `www.catapoolt.xyz` kanonik, apex 308 → www.

## 2. Remix — Basin

- Solidity `0.8.24`, optimizer **200**, EVM **cancun**, Injected 4663.
- Constructor `ops_` = OPS EOA (tek `pull` ve `handOver` yetkisi olan cüzdan).
- Deploy sonrası Blockscout verify (single file, MIT), `socials()` oku.
- `pendingEscrow()` ve `hoard()` view'ları site için hazır.

**Deploy etmeden önce doğrula:** Basin escrow/factory/buyback arayüzlerini varsayıyor.
Blockscout'ta `0xd3AF…Ac9e` (escrow) ve `0x7eD5…EC7e` (factory) ABI'sinde
`claim()`, `claimToken(address)`, `balanceOf(address)`,
`transferCreatorFeeRecipient(address,address)` imzaları birebir var mı bak.
Yoksa `try/catch` sessizce yutar ve "para neden gelmiyor" günü yaşarsın.

## 3. Launch günü — sıra (03-CONTRACTS-LAUNCH.md ile aynı)

```
canLaunch(OPS) → Basin deploy → launchConfig oku → maxCreatorTaxBps oku
→ previewLaunchEconomics → launchToken(creatorFeeRecipient = OPS EOA, buyback = true)
→ TokenLaunched'dan token + curve → Basin.setToken / setCurve
→ küçük test alışı → escrow.balanceOf(OPS) > 0 GÖR
→ transferCreatorFeeRecipient(token, BASIN) → Basin.harvest() → bakiye arttı mı
→ site.ts: TOKEN_CA / CURVE_CA / BASIN_CA / LAUNCH_BLOCK → push main
```

`LAUNCH_BLOCK`'u doldurmayı unutma; yoksa indexer zincirin başından tarar ve 429 yer.

## 4. Sonraki iş (bu oturumda yazılmadı)

- `/how`, `/landing`, `/basin`, `/play` route'ları
- js13k motorunun `/play` içine gömülmesi (iframe değil, vite build entegrasyonu)
- X kiti görselleri (logo 800², banner 1500×500, pons karesi 1024²)
