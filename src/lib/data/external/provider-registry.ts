import { externalProviderContracts } from "./provider-contracts";
import type { ProviderId } from "./types";

export interface ProviderPolicy {
  readonly id: ProviderId;
  readonly name: string;
  readonly origin: string;
  readonly authentication: "nasa-api-key" | "none" | "historical-snapshot";
}

export const providerPolicies = Object.freeze(
  Object.fromEntries(
    Object.values(externalProviderContracts).map((contract) => [
      contract.id,
      {
        id: contract.id,
        name: contract.name,
        origin: contract.origin,
        authentication: contract.authentication,
      },
    ]),
  ),
) as Readonly<Record<ProviderId, ProviderPolicy>>;
