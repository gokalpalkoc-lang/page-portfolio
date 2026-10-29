import { describe, expect, it } from "vitest";
import { contentSchema, describeIssue, paragraphs } from "@/lib/content/schema";
import { seedContent } from "@/lib/content/seed";

const clone = () => structuredClone(seedContent);

describe("content schema", () => {
  it("accepts the seed content", () => {
    expect(contentSchema.safeParse(seedContent).success).toBe(true);
  });

  it("refuses links that are not http(s)", () => {
    const content = clone();
    content.projects[0]!.url = "javascript:alert(1)";
    content.links[0]!.url = "ftp://example.com";
    const result = contentSchema.safeParse(content);
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((issue) => describeIssue(content, issue));
    expect(messages).toContain("Projects › Operon Biology › Link: Must be a full address starting with https://");
    expect(messages.some((m) => m.startsWith("Profile › Links › LinkedIn › Link:"))).toBe(true);
  });

  it("only allows images from the uploads folder", () => {
    const content = clone();
    content.profile.photo = "https://evil.example/x.png";
    expect(contentSchema.safeParse(content).success).toBe(false);
    content.profile.photo = "/uploads/0b8e-4f.webp";
    expect(contentSchema.safeParse(content).success).toBe(true);
    content.profile.photo = "/uploads/../content.json";
    expect(contentSchema.safeParse(content).success).toBe(false);
  });

  it("names the entry an issue belongs to", () => {
    const content = clone();
    content.sections[0]!.items[0]!.title = "  ";
    const result = contentSchema.safeParse(content);
    expect(result.error!.issues.map((issue) => describeIssue(content, issue))).toEqual([
      "Achievements › Experience › Item 1 › Title: Required",
    ]);
  });

  it("describes issues in malformed input without throwing", () => {
    const result = contentSchema.safeParse({ projects: "nope" });
    expect(result.success).toBe(false);
    expect(() => result.error!.issues.map((issue) => describeIssue({ projects: "nope" }, issue))).not.toThrow();
  });

  it("splits the introduction into paragraphs on blank lines", () => {
    expect(paragraphs("One\nstill one\n\n  Two  \n \n\nThree")).toEqual(["One\nstill one", "Two", "Three"]);
    expect(paragraphs("   ")).toEqual([]);
  });
});
