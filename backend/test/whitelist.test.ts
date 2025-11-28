"use strict";

import request from "supertest";
import express from "express";
import { promises as fs } from "fs";
import path from "path";

describe("GET /api/whitelist/status (proof integration)", () => {
  const tmpDir = path.resolve(__dirname, ".tmp-merkle-proof");
  const address = "0x1111111111111111111111111111111111111111";

  beforeAll(async () => {
    await fs.mkdir(tmpDir, { recursive: true });
    process.env.MERKLE_OUTPUT_DIR = tmpDir;

    const whitelist = [{ address, amount: "12345" }];
    const merkleTree = {
      merkleRoot: "0x" + "a".repeat(64),
      airdropData: [
        {
          address,
          amount: "12345",
          proof: ["0x" + "b".repeat(64)],
        },
      ],
    };

    await fs.writeFile(
      path.join(tmpDir, "whitelist.json"),
      JSON.stringify(whitelist, null, 2)
    );
    await fs.writeFile(
      path.join(tmpDir, "merkle-tree.json"),
      JSON.stringify(merkleTree, null, 2)
    );
  });

  afterAll(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it("returns allocation and merkle proof when available", async () => {
    const whitelistRouter = require("../src/api/whitelist").default;
    const app = express();
    app.use(express.json());
    app.use("/api/whitelist", whitelistRouter);

    const res = await request(app)
      .get(`/api/whitelist/status`)
      .query({ address });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      isWhitelisted: true,
      allocation: "12345",
      proof: ["0x" + "b".repeat(64)],
    });
  });
});
