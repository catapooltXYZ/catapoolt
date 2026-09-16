# Launch — Catapoolt on pons v2

Robinhood Chain **4663**. Pad is pons v2, not letscash. Site is live first; token second.

Canonical URL: `https://www.catapoolt.xyz` (apex 308 → www).

## Blocker

`canLaunch(OPS)` must be true. Public launch is closed until whitelist. Mail contact@ponsfamily.com.

## Order (do not skip, do not reorder)

```
canLaunch(OPS)
→ deploy Basin (ops = OPS EOA)
→ read launchConfig + maxCreatorTaxBps
→ previewLaunchEconomics
→ launchToken(creatorFeeRecipient = OPS EOA, buybackEnabled = true)
→ TokenLaunched → token + curve
→ Basin.setToken / setCurve (one-shot, onlyOps)
→ small test buy
→ prove escrow.balanceOf(OPS) > 0
→ transferCreatorFeeRecipient(token, BASIN)
→ Basin.harvest()
→ fill src/lib/site.ts: TOKEN_CA, CURVE_CA, BASIN_CA, LAUNCH_BLOCK
→ push main
```

Creator fee recipient starts as the OPS EOA. Hand over to Basin only after a live claim is proven. Basin must implement escrow.claim() + transferCreatorFeeRecipient passthrough.

`LAUNCH_BLOCK` is required. Empty means the indexer walks from genesis and 429s.

## Basin

- Solidity `0.8.24`, optimizer 200, EVM cancun.
- Constructor `ops_` = OPS EOA (only `pull` and `handOver`).
- Verify on Blockscout (single file, MIT), read `socials()`.
- Confirm escrow `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e` and factory `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` expose `claim()`, `claimToken(address)`, `balanceOf(address)`, `transferCreatorFeeRecipient(address,address)`.

## Site constants

Empty string CA = phase 0. Never display a placeholder address. Harvest stays dark until `BASIN_CA` is real.

RPC has no JSON-RPC batch. viem uses `batch: false`. Sequential reads, 2000-block log chunks.

## After graduation

`/play` unlocks. Scores stay on device. Harvest is permissionless and does not pay the caller.
