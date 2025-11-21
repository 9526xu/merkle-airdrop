import request from "supertest";
import express from "express";
import claimRouter from "../src/api/claim";

// Mock the relayClaim service
jest.mock("../src/services/claimService", () => ({
  relayClaim: jest.fn().mockResolvedValue({ hash: "0xmockedhash" }),
}));

const app = express();
app.use(express.json());
app.use("/api", claimRouter);

describe("POST /api/claim", () => {
  it("should return a transaction hash for a valid claim", async () => {
    const claimData = {
      claimer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      amount: "100000000000000000000",
      merkleProof: [
        "0x65caba9ac8f81786589c59b27b31c7f461471552481c71ae9bb21a50d6cc8bec",
      ],
      signature: "0xmockedsignature",
    };

    const response = await request(app).post("/api/claim").send(claimData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ transactionHash: "0xmockedhash" });
  });

  it("should return 400 for missing data", async () => {
    const response = await request(app).post("/api/claim").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required claim data." });
  });
});
