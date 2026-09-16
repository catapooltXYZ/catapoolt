# Launch — Catapoolt on pons v2

Robinhood Chain **4663**. Pad is pons v2, not letscash. Site is live first; token second.

Canonical URL: `https://www.catapoolt.xyz` (apex 308 → www).

## Blocker

Public launching is currently **open** (`launchEnabled()` = true on the factory). Still read `canLaunch(OPS)` before `launchToken`. If it reverts `NotWhitelisted`, mail contact@ponsfamily.com.

Config `0`: 1B supply, curve fee 100 bps, graduation 4.2 ETH, tick spacing 200, enabled.

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
- Deploy from the Pond page (connect OPS wallet) or:

```
forge create contracts/Basin.sol:Basin \
  --rpc-url https://rpc.mainnet.chain.robinhood.com \
  --broadcast --evm-version cancun --optimizer-runs 200 \
  --constructor-args $OPS
```

Do not paste a private key in chat. Verify on Blockscout (single file, MIT), read `socials()`.

## Site constants

Empty string CA = phase 0. Never display a placeholder address. Harvest stays dark until `BASIN_CA` is real.

RPC has no JSON-RPC batch. viem uses `batch: false`. Sequential reads, 2000-block log chunks.

## After graduation

`/play` unlocks. Scores stay on device. Harvest is permissionless and does not pay the caller.
