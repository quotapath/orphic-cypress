import { Fifo, safeKebabCase, segmentMDX } from "./segment-mdx";
// @ts-ignore
import ToSegment from "./__mock__/to-segment.md";
// @ts-ignore
import WithFileAndAlternateHeaders from "./__mock__/with-file-and-alternating-headers.md";

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

  describe("safeKebabCase", () => {
    it("should handle space separated titles", () => {
      expect(safeKebabCase("Some title withCamelCase")).to.equal(
        "some-title-withcamelcase"
      );
    });

    it("should handle null, undefined, falsey, and non-string cases", () => {
      expect(safeKebabCase(null)).to.equal(null);
      expect(safeKebabCase(undefined)).to.equal(null);
      expect(safeKebabCase(false as any)).to.equal(null);
      expect(safeKebabCase(["not", "a", "string"] as any)).to.equal(null);
    });
  });

  describe("segmentMDX", () => {
    describe("ToSegment mock", () => {
      // note: should be an mdx file but something about the setup makes that weird
      const result = segmentMDX(ToSegment as any, true);
      const keys = ["file", "fully-skipped", "ignoring-via-cyincludestories"];

      it("should have kebab-cased keys for all headers, as well as 'file'", () => {
        expect(result).to.have.keys(keys);
      });

      it("should have functions at each key which also have access keys for body, full and md", () => {
        keys.forEach((key) => {
          const atKey = result[key];
          expect(atKey).to.be.a("function");
          expect(atKey).to.have.keys(["body", "full", "md"]);
        });
      });

      it("should have functions which are a shortcut to 'full'", () => {
        keys.forEach((key) => {
          const atKey = result[key];
          expect(atKey()).to.equal(
            atKey.full,
            "function call is a shortcut to 'full'"
          );
        });
      });

      it("should have a body property which is the full property without the header", () => {
        keys.forEach((key) => {
          const atKey = result[key];
          expect(atKey.full.slice(1)).to.deep.equal(
            atKey.body,
            "body is always the same as full but without the header"
          );
          if (atKey.full.length) {
            // 'file' won't have full or body
            expect(atKey.full[0].props.mdxType).to.equal(
              "h1",
              "first item of full is the header"
            );
            expect(safeKebabCase(atKey.full[0].props.children)).to.equal(
              key,
              "header is title cased and space separated key"
            );
          }
        });
      });

      it("should have nothing at the file level", () => {
        expect(Object.entries(result.file)).to.deep.equal(
          [
            ["full", []],
            ["body", []],
            ["md", ""],
          ],
          "nothing for file level"
        );
      });

      it("should have a 'full-skipped' segment which has stories", () => {
        const contents = result["fully-skipped"].body;

        expect(contents).to.have.length(3, "explanatory text, then 2 stories");

        expect(contents[0].props.mdxType).to.equal("p");
        expect(contents[0].props.children[0]).to.contain("skip test files");

        expect(contents[1].props.mdxType).to.equal("Canvas");
        const firstStory = contents[1].props.children;
        expect(firstStory.props.mdxType).to.equal("Story");
        expect(firstStory.props.id).to.equal(
          "skippingandselecting-fullyskipped--skipped"
        );

        const secondStory = contents[2].props.children;
        expect(secondStory.props.mdxType).to.equal("Story");
        expect(secondStory.props.id).to.equal(
          "skippingandselecting-fullyskipped--another"
        );

        expect(result["fully-skipped"].md).to.equal("");
      });

      it("should have a 'ignoring-via-cyincludestories' segment which contains raw markdown", () => {
        const key = "ignoring-via-cyincludestories";
        const contents = result[key].body;

        expect(contents.length).to.equal(1, "just the markdown");

        expect(result[key].md.split("\n")).to.deep.equal([
          "`cyIncludeStories` allows similar functionality to includeStories on the default export.",
          "It can be used to ensure that only some stories are tested while the others don't",
          "register with cypress at all, where [.cySkip](/docs/skippingandselecting-fullyskipped--skipped)",
          "will designate them as 'pending'.",
          "",
        ]);

        expect(contents[0].props.mdxType).to.equal("pre");
        expect(contents[0].props.children.props.mdxType).to.equal("code");
        expect(contents[0].props.children.props.className).to.equal(
          "language-md"
        );
      });
    });

    describe("WithFileAndAlternateHeaders", () => {
      const result = segmentMDX(WithFileAndAlternateHeaders as any);
      const keys = ["file", "first-header", "second-header"];

      it("should have 2 headers and file", () => {
        expect(result).to.have.keys(keys);
      });

      it("should have file level details", () => {
        expect(result.file.full).to.have.length(1);
        expect(result.file.full[0].props.mdxType).to.equal("p");
        expect(result.file.full).to.deep.equal(result.file.body);
      });
    });

    it("should return an empty object if mdx is not a function", () => {
      expect(segmentMDX("test" as any)).to.deep.equal({});
    });

    it("should maintain a cache", () => {
      const key = ["test"] as any; // just proving key is shallow equal
      const r1 = segmentMDX(key);
      expect(r1).to.deep.equal({});
      expect(segmentMDX(key)).to.equal(r1);
    });
  });
});
