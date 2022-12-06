import { Fifo, segmentMDX } from "./segment-mdx";

describe("segment-mdx", () => {
  describe("Fifo", () => {
    const k1 = ["not", "shallow", "equal"];
    const k2 = { not: "shallow" };
    const v1 = ["v", "1"];
    const v2 = { v: "1" };

    it("should allow getting and setting setting values", () => {
      const fifo = new Fifo();
      fifo.set(k1, v1);
      fifo.set(k2, v2);
      expect(fifo.get(k1)).to.equal(v1);
      expect(fifo.get(k2)).to.equal(v2);
    });

    it("should delete earlier values if the size exceeds the given limit", () => {
      const fifo = new Fifo(2);
      fifo.set(1, "1");
      fifo.set(2, "2");
      expect(fifo.get(1)).to.equal("1");
      expect(fifo.get(2)).to.equal("2");
      expect(fifo.get(3)).to.equal(undefined, "not set yet");
      fifo.set(3, "3");
      expect(fifo.get(1)).to.equal(undefined, "fifo removed");
      expect(fifo.get(2)).to.equal("2");
      expect(fifo.get(3)).to.equal("3");
    });
  });

  describe("segmentMDX", () => {
    // TODO

    it("should return an empty object if mdx is not a function", () => {
      expect(segmentMDX("test" as any)).to.deep.equal({});
    });
  });
});
