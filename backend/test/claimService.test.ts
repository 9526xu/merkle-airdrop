process.env.RELAYER_PRIVATE_KEY = "0x" + "1".repeat(64);
process.env.AIRDROP_CONTRACT_ADDRESS =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

jest.mock("ethers", () => {
  const getCode = jest.fn().mockResolvedValue("0x");
  class JsonRpcProvider {
    getCode = getCode;
  }
  class Wallet {}
  class Contract {}
  return {
    __esModule: true,
    ethers: { providers: { JsonRpcProvider }, Wallet, Contract },
  };
});

const { relayClaim } = require("../src/services/claimService");

describe("claimService precheck", () => {
  it("throws when contract code is empty at configured address", async () => {
    await expect(
      relayClaim(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "100",
        ["0x" + "0".repeat(64)],
        "0x" + "2".repeat(128)
      )
    ).rejects.toThrow("Airdrop contract not deployed at configured address");
  });
});
