import test from "node:test";
import assert from "node:assert/strict";
import {
  createConstructorContext,
  createCircuitContext,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  ledger,
} from "../contracts/managed/dignity-pass/contract/index.js";
import {
  agencyHash,
  bytes32,
  couponValues,
  createCoupon,
  parseCoupon,
} from "../lib/coupon";
import { witnesses, type DignityPassPrivateState } from "../lib/dignity-pass";
import { DIGNITY_PASS_CONTRACT_ADDRESS } from "../lib/config";

const agency = bytes32("ab".repeat(32));
const secret = bytes32("cd".repeat(32));
const nonce = bytes32("ef".repeat(32));
const campaign = "12".repeat(32);
const values = couponValues(secret, nonce, campaign);
function setup(key = agencyHash(agency), limit = 5n) {
  const contract = new Contract<DignityPassPrivateState>(witnesses);
  const state: DignityPassPrivateState = {
    agencySecret: agency,
    couponSecret: secret,
    couponNonce: nonce,
  };
  const initial = contract.initialState(
    createConstructorContext(state, "00".repeat(32)),
    bytes32(key),
    bytes32(campaign),
    0n,
    limit,
  );
  const context = createCircuitContext(
    DIGNITY_PASS_CONTRACT_ADDRESS,
    "00".repeat(32),
    initial.currentContractState,
    state,
  );
  return { contract, context };
}
test("required witnesses initialize the generated contract", () => {
  assert.doesNotThrow(() => setup());
});
test("coupon derivation matches generated issuance and redemption circuits", () => {
  const { contract, context } = setup();
  const issued = contract.circuits.issueCoupon(
    context,
    bytes32(values.commitment),
  );
  const redeemed = contract.circuits.redeem(issued.context);
  assert.equal(
    contract.circuits.isRedeemed(redeemed.context, bytes32(values.nullifier))
      .result,
    true,
  );
  assert.equal(contract.circuits.totalIssued(redeemed.context).result, 1n);
});
test("second redemption is rejected", () => {
  const { contract, context } = setup();
  const issued = contract.circuits.issueCoupon(
    context,
    bytes32(values.commitment),
  );
  const redeemed = contract.circuits.redeem(issued.context);
  assert.throws(
    () => contract.circuits.redeem(redeemed.context),
    /already redeemed/,
  );
});
test("revoked coupons cannot be redeemed", () => {
  const { contract, context } = setup();
  const issued = contract.circuits.issueCoupon(
    context,
    bytes32(values.commitment),
  );
  const revoked = contract.circuits.revokeCoupon(
    issued.context,
    bytes32(values.commitment),
  );
  assert.throws(() => contract.circuits.redeem(revoked.context), /revoked/);
});
test("placeholder agency key rejects generated credentials", () => {
  const { contract, context } = setup("22".repeat(32));
  assert.throws(
    () => contract.circuits.issueCoupon(context, bytes32(values.commitment)),
    /Only agency/,
  );
});
test("pause blocks redemption and resume restores it", () => {
  const { contract, context } = setup();
  const issued = contract.circuits.issueCoupon(
    context,
    bytes32(values.commitment),
  );
  const paused = contract.circuits.pause(issued.context);
  assert.throws(() => contract.circuits.redeem(paused.context), /not open/);
  const resumed = contract.circuits.resume(paused.context);
  assert.doesNotThrow(() => contract.circuits.redeem(resumed.context));
});
test("closed campaign cannot resume", () => {
  const { contract, context } = setup();
  const closed = contract.circuits.closeCampaign(context);
  assert.throws(() => contract.circuits.resume(closed.context), /not paused/);
});
test("unissued pass fails redemption", () => {
  const { contract, context } = setup();
  assert.throws(() => contract.circuits.redeem(context), /Invalid coupon/);
});
test("issuance respects the configured limit", () => {
  const { contract, context } = setup(undefined, 1n);
  const issued = contract.circuits.issueCoupon(
    context,
    bytes32(values.commitment),
  );
  assert.throws(
    () =>
      contract.circuits.issueCoupon(issued.context, bytes32("99".repeat(32))),
    /limit reached/,
  );
});
test("private pass parsing validates network, contract, campaign, and secret size", () => {
  const coupon = createCoupon(campaign);
  assert.deepEqual(parseCoupon(JSON.stringify(coupon), campaign), coupon);
  for (const bad of [
    { ...coupon, network: "mainnet" },
    { ...coupon, contractAddress: "00".repeat(32) },
    { ...coupon, campaignId: "ff".repeat(32) },
    { ...coupon, secret: "gg".repeat(32) },
  ])
    assert.throws(() => parseCoupon(JSON.stringify(bad), campaign));
  assert.throws(() => parseCoupon("not json", campaign));
});
test("generated coupons have different cryptographic secrets", () => {
  const first = createCoupon(campaign);
  const second = createCoupon(campaign);
  assert.notEqual(first.secret, second.secret);
  assert.notEqual(first.nonce, second.nonce);
});
test("nullifiers differ across campaign scopes", () => {
  assert.notEqual(
    values.nullifier,
    couponValues(secret, nonce, "34".repeat(32)).nullifier,
  );
});
test("public state contains commitment and nullifier, not raw secrets", () => {
  const { contract, context } = setup();
  const issued = contract.circuits.issueCoupon(
    context,
    bytes32(values.commitment),
  );
  const redeemed = contract.circuits.redeem(issued.context);
  const state = ledger(redeemed.context.currentQueryContext.state);
  assert.equal(state.issuedCoupons.member(secret), false);
  assert.equal(state.redeemedNullifiers.member(secret), false);
});
