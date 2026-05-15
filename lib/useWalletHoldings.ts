"use client";

import { useMemo } from "react";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import type { Holding } from "@/components/HoldingsCarousel";
import { NATIVE_BY_CHAIN, TOKENS_BY_CHAIN } from "@/lib/tokens";

export type WalletHoldingsResult = {
  isConnected: boolean;
  isLoading: boolean;
  holdings: Holding[];
  chainId: number | undefined;
  address: `0x${string}` | undefined;
};

export function useWalletHoldings(): WalletHoldingsResult {
  const { address, chainId, isConnected } = useAccount();

  const tokens = chainId ? TOKENS_BY_CHAIN[chainId] || [] : [];
  const native = chainId ? NATIVE_BY_CHAIN[chainId] : undefined;

  const nativeQuery = useBalance({
    address,
    chainId,
    query: { enabled: Boolean(address && chainId) },
  });

  const contracts = useMemo(
    () =>
      address
        ? tokens.map((t) => ({
            address: t.address,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address] as const,
            chainId,
          }))
        : [],
    [address, chainId, tokens],
  );

  const tokensQuery = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 },
  });

  const holdings = useMemo<Holding[]>(() => {
    if (!isConnected || !address) return [];

    // Aggregate by CoinGecko ID so wrapped + native + variants merge cleanly.
    const byId = new Map<string, number>();

    if (native && nativeQuery.data) {
      const v = Number(formatUnits(nativeQuery.data.value, native.decimals));
      if (v > 0) byId.set(native.coinGeckoId, (byId.get(native.coinGeckoId) ?? 0) + v);
    }

    if (tokensQuery.data) {
      tokensQuery.data.forEach((res, i) => {
        if (res.status !== "success") return;
        const t = tokens[i];
        const raw = res.result as bigint;
        const v = Number(formatUnits(raw, t.decimals));
        if (v <= 0) return;
        byId.set(t.coinGeckoId, (byId.get(t.coinGeckoId) ?? 0) + v);
      });
    }

    return Array.from(byId.entries()).map(([coinId, amount]) => ({
      coinId,
      amount,
    }));
  }, [isConnected, address, native, nativeQuery.data, tokensQuery.data, tokens]);

  const isLoading =
    isConnected &&
    (nativeQuery.isLoading || (contracts.length > 0 && tokensQuery.isLoading));

  return {
    isConnected,
    isLoading: Boolean(isLoading),
    holdings,
    chainId,
    address,
  };
}
