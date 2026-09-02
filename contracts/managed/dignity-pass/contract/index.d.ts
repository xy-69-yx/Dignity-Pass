import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum CampaignState { OPEN = 0, PAUSED = 1, CLOSED = 2 }

export type Witnesses<PS> = {
  agencySecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  couponSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  couponNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  issueCoupon(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCoupon(context: __compactRuntime.CircuitContext<PS>,
               commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  resume(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeCampaign(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  redeem(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  isIssued(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  isRedeemed(context: __compactRuntime.CircuitContext<PS>,
             nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  campaignExpiry(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  totalIssued(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  issueCoupon(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCoupon(context: __compactRuntime.CircuitContext<PS>,
               commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  resume(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeCampaign(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  redeem(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  isIssued(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  isRedeemed(context: __compactRuntime.CircuitContext<PS>,
             nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  campaignExpiry(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  totalIssued(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  issueCoupon(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCoupon(context: __compactRuntime.CircuitContext<PS>,
               commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  resume(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeCampaign(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  redeem(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  isIssued(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  isRedeemed(context: __compactRuntime.CircuitContext<PS>,
             nullifier_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  campaignExpiry(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  totalIssued(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly agencyKey: Uint8Array;
  readonly campaignId: Uint8Array;
  readonly expiresAt: bigint;
  readonly maxCoupons: bigint;
  readonly state: CampaignState;
  issuedCoupons: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  revokedCoupons: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  redeemedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly issuedCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               agencyKeyHash_0: Uint8Array,
               campaign_0: Uint8Array,
               expiry_0: bigint,
               couponLimit_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
